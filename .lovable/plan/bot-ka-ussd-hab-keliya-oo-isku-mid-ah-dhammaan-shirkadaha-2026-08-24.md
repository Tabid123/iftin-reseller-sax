# Bot-ka USSD: hab keliya oo isku mid ah dhammaan shirkadaha

## Dhibaatada hadda

Bot-ka wuxuu leeyahay dariiqyo (code paths) kala duwan, oo qaar shirkad-gaar ah:

- **Somtel**: xogta waa la galiyaa, laakiin **Send lama taabto**. Sababta: hubinta ("verify") ee PIN/qiimaha waxay u baahan tahay in field-ka si sax ah la akhriyo; haddii carrier-ku qiimaha qariyo ama field-ka aan la akhriyi karin, `submitPinOnce` waa la joojiyaa oo Send waligeed lama riixo.
- **Somnet**: waxaa loo yeedhaa dariiq gaar ah (IME keypad) + delay 3000ms, sidoo kale generic auto-click loop-ka wuu riixi karaa Send **ka hor** inta xogta aan la gelin.
- **Amtel**: tallaabooyinka hore waa fiican, laakiin **tallaabada PIN-ka ee ugu dambeysa Send lama riixo** (isla hubinta adag ee kor ku xusan).

Sababta gundhig: laba nidaam Send oo kala duwan (PIN vs non-PIN), waqtiyo kala duwan (2200/3000/3200/1500ms), iyo haddii-shirkad (`if provider contains "somnet"`) branch-yo.

## Farqiga u dhexeeya Amtel hadda iyo qorshaha

Amtel waa **halbeegga (reference)**. Dariiqa Amtel ee tallaabooyinka hore (write → verify → send ee non-PIN) waa **la ilaalinayaa sida uu yahay** — waxba ka beddelan maayo. Farqiga kaliya:

| | Amtel hadda | Ka dib |
|---|---|---|
| Tallaabooyinka hore (number/amount/menu) | Shaqeeya | Isku mid, waxba lama beddelin |
| Tallaabada PIN-ka (Send) | Send lama riixo marka field-ka masked/aan la akhriyi karin | Send waa la riixayaa marka xog dhab ah ku jirto field-ka |
| Somtel & Somnet | Dariiq gaar ah (branch-yo) | Isla dariiqa Amtel ayaa la marsiinayaa |

Marka: **dariiqa Amtel ee shaqeeya waa la guud-mareynayaa dhammaan shirkadaha**, oo kaliya bug-ga PIN-Send ayaa la hagaajinayaa.

## Xalka: hal state machine oo mid ah

Dhammaan tallaabooyinka (PIN iyo non-PIN, dhammaan shirkadaha) waxay marayaan **isku dariiq mid ah** — kaas oo ah dariiqa Amtel:

```text
Dialog cusub la arkay
   -> match step (keyword ama sequential fallback)   [sida hadda, lama beddelin]
   -> WRITE:  focus -> clear -> ACTION_SET_TEXT -> haddii fail: PASTE -> haddii fail: IME keypad
   -> VERIFY: dib akhri field-ka (qiimo saxda ah, ama masked oo dherer isku mid,
              ama masked-length haddii carrier qariyay)
   -> SEND:   hal riix oo keliya, ka dib delay mid ah
   -> haddii VERIFY guuldareysato: dib u qor (ilaa 2 jeer), ka dibna
              Send weli riix haddii field-ku muujiyo in wax la galiyay (masked/length>0)
```

Waxa la beddelayo:

1. **Ka saar branch-yada shirkad-gaar ah** ee `UssdAccessibilityService.kt`: `provider.contains("somnet")` labada meel (dariiqa write iyo delay-ga submit) waa la tirtirayaa. `visible_ime_keypad` wuxuu noqonayaa fallback guud oo dhammaan shirkadaha, kaliya marka SET_TEXT iyo PASTE labaduba fail-gareeyaan (ma aha oo hore).
2. **Hal delay mid ah**: `SUBMIT_DELAY_MS = 2500` iyo `RECHECK_DELAY_MS = 1200` — la isticmaalo PIN iyo non-PIN si isku mid ah (`CLICK_DELAY_MS`, `NON_PIN_SUBMIT_DELAY_MS`, 3000L Somnet, `SUBMIT_RECHECK_DELAY_MS` waa la mideynayaa).
3. **Hal submit function**: `submitStepOnce(expectedValue, isPin, source)` oo beddelaya `submitPinOnce` + non-PIN submit runnable-ka gudaha `handleDynamicFlowStep`. Hal `scheduledSubmitRunnable`, hal counter, hal guard.
4. **Bug-ga ugu weyn — PIN Send (Amtel & Somtel)**: `isValueCommittedInActiveField` waxaa lagu darayaa xaalad saddexaad — haddii field-ku yahay password/masked oo `text` madhan yahay laakiin `findMaskedPinLengthInTree` = dhererka la filayo, waa la aqbalayaa. Sidoo kale, ka dib 2 dib-u-qorid, haddii field-ku leeyahay `textLength > 0` Send **waa la riixayaa** halkii laga joojin lahaa gebi ahaanba. Kani waa sababta "PIN-ka la galiyay laakiin Send lama taabto".
5. **Ka hor-tag riixid degdeg (Somnet fix)**: `shouldSuppressAutoClickForDialog` wuxuu ahaanayaa hal ilaha runta — inta `scheduledSubmitRunnable` ay pending tahay, generic auto-click loop-ka gebi ahaanba waa la xirayaa (marker cusub `awaitingScheduledSubmit`), sidaas Somnet Send ma riixayo iyada oo aan xog jirin.
6. **Log mid ah**: dhammaan tallaabooyinka waxay qorayaan hal qaab log ah (`USSD[step=n provider=x] WRITE/VERIFY/SEND`) si dib u eegis fudud u noqdo.


## Faylalka la taabanayo

- `android-app/app/src/main/kotlin/com/iftin/delivery/service/UssdAccessibilityService.kt` (kaliya isaga)

Web app-ka, database-ka, iyo `ussd_flows` steps-ka **lama beddelayo** — flow-yada admin-ka sida ay yihiin ayay sii shaqeynayaan.

## Dhisidda APK-ga

`.github/workflows/android-apk.yml` horey ayuu u jiray. Ka dib isbeddelka, waxaan:

- hubinayaa in workflow-ka uu si sax ah u kicin karo (trigger) oo APK-ga soo saarayo artifact ahaan,
- kuu sheegayaa sida workflow-ka laga wado GitHub (Actions -> Run workflow) iyo halka APK-ga laga soo dejinayo.

Kotlin-ka lagama compile-gareeyo halkan (Lovable waa web runtime), sidaas darteed dhisidda dhabta ah waxay dhacaysaa GitHub Actions.
