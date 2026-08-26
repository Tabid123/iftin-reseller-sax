# USSD bot-ka: state machine content-based ah

## Hadaf
Bot-ka Somnet, Somtel, iyo Amtel waxaa loo beddelayaa hal state machine oo dialog-ka ku garta qoraalkiisa, halkii uu timing iyo sequential fallback ku tiirsanaan lahaa. Tani waxay joojinaysaa value hore oo dialog cusub lagu qoro, double-write, Send madhan, iyo final confirmation oo istaaga.

## Isbeddellada
1. **Step matching adag**
   - PIN prompt-ka mudnaanta koowaad sii.
   - Package menus-ka ka garo numbered rows + package/saac/MB/GB/unlimited markers ka hor generic keywords.
   - Ka saar sequential fallback-ka aan keyword sax ah lahayn; step dambe ama hore lama qori karo haddii dialog-ku uusan si cad ula jaanqaadin.
   - Menu answer keyword ahaan uga raadi row-ga hadda muuqda; hardcoded number waxaa loo isticmaalaa fallback keliya.

2. **Write → verify → send gaaban oo ammaan ah**
   - Qor hal mar, 350ms kadib root-ka cusub soo qaado, xaqiiji value-ga.
   - Haddii verify fashilmo, hal mar dib u qor; haddii weli madhan/qaldan yahay Send ha riixin, event-ka xiga ha retry-gareeyo.
   - Haddii Send button uusan diyaar ahayn, 900ms kadib hal mar retry; step completed ka dhig keliya click guuleystay kadib.
   - Ka saar “final write then Send anyway” oo sababay Somnet inuu qiimo qaldan diro.

3. **Saddex race guards**
   - 400ms global click debounce.
   - Attempt key (`step + input + prompt`) oo 1200ms gudahood duplicate-ka diida.
   - Session token cusub marka dial timestamp is beddelo; wuxuu nadiifiyaa attempts, PIN state, iyo completed steps.

4. **State persistence iyo dialog identity**
   - Completed steps SharedPreferences ku kaydi si service restart uusan step hore dib ugu jawaabin.
   - Scheduled action kasta ku xir session token + step order + stable prompt signature.
   - Dialog content change-ka ka dib 350ms render delay ku akhri root cusub; ku dar `TYPE_WINDOWS_CHANGED` listener.

5. **Terminal result iyo self-healing**
   - Terminal waxaa loo aqoonsadaa keliya marka dialog-ku uusan match-gareyn step pending ah, ma aha “EditText ma jiro” oo keliya.
   - Ka dib PIN submit, watcher xaddidan ayaa dhammaan windows-ka ka raadinaya OK/Dismiss.
   - Existing 30s expecting timeout waa la ilaalinayaa; session start wuxuu tirtirayaa stale state/actions.

## Faylasha
- `android-app/app/src/main/kotlin/com/iftin/delivery/service/UssdAccessibilityService.kt`
- `android-app/app/src/main/res/xml/accessibility_service_config.xml`

Web app-ka, database-ka, iyo admin flow records lama beddelayo.

## Xaqiijin
- Hubi inaan step completed noqon ka hor click guuleystay.
- Hubi inaan unverified/empty amount, receiver, PIN, ama menu response la dirin.
- Hubi duplicate event, stale runnable, iyo session cusub aysan value hore adeegsan.
- Samee static Kotlin checks; APK build-ka dhabta ah GitHub Actions ayuu ka dhacayaa.
