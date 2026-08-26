# USSD bot: hal hab oo isku mid ah Somtel, Somnet, iyo Amtel

## Waxa videos-ka iyo code-ka hadda muujinayaan

Bot-ka waxaa hore loogu daray fikradda “write → verify → send”, laakiin wali waxaa jira meel muhiim ah oo Send-ka xannibaysa:

- Scheduled submit-ka ayaa `awaitingScheduledSubmit = true` dhiga marka uu sugayo inuu Send riixo.
- Laakiin marka scheduled submit-ku gaaro `clickSendOrOkButton(...)`, function-kaas wuxuu mar kale wacayaa `shouldSuppressAutoClickForDialog(...)`.
- `shouldSuppressAutoClickForDialog(...)` wuxuu arkaa `awaitingScheduledSubmit = true`, markaas ayuu Send-ka xannibaa.

Natiijo ahaan: mararka qaar bot-ka **isagii qorsheeyay Send** ayaa is xannibaya, taas oo sharxi karta Somtel/Amtel Send la’aanta iyo Somnet istaagga.

## Hadafka

Dhammaan shirkadaha USSD waa inay maraan hal hab keliya:

```text
Dialog la arkay
  -> step sax ah dooro
  -> field sax ah dooro
  -> xogta saxda ah qor
  -> hubi in field-ku xog hayo
  -> Send/OK riix hal mar
  -> dialog cusub sug
```

Ma jiri doono hab shirkad-gaar ah oo Somtel/Somnet/Amtel ku kala duwan.

## Qorshaha hagaajinta

1. **Kala saar “generic auto-click” iyo “scheduled submit”**
   - `shouldSuppressAutoClickForDialog` wuxuu sii xannibayaa kaliya auto-click-ka guud.
   - Scheduled submit-ka rasmiga ah wuxuu heli doonaa waddo ammaan ah oo Send ku riixi karta marka xogta la qoray.
   - Tani waxay ka hortagaysaa bug-ga hadda jira ee scheduled submit-ku is xannibayo.

2. **Hal function rasmi ah oo Submit ah**
   - Samee/adeegso hal function oo ah `sendCurrentStep(...)` ama wax la mid ah.
   - Function-kan waxaa isticmaali doona PIN iyo non-PIN labadaba.
   - Waxaa lagu xiri doonaa dialog signature si uusan value hore ugu qorin dialog cusub.

3. **Ha calaamadin step inuu dhammaaday ilaa Send guuleysto**
   - Hadda non-PIN step waxaa lagu daraa `completedFlowSteps` isla marka wax la qoro.
   - Waxaan beddeli doonaa in step-ka la dhammeeyay la calaamadiyo kaliya kadib Send/OK click guuleysto.
   - Tani waxay yaraynaysaa in Somnet uu step hore ka boodo ama value qaldan u isticmaalo step xiga.

4. **Field selection sax ah dhammaan shirkadaha**
   - PIN iyo non-PIN labaduba waxay adeegsan doonaan isla logic-ka `collectEditableFieldCandidates` + `selectBestEditableCandidate`.
   - Haddii field-ku hore wax ugu jiraan, waa la clear-gareynayaa ka hor intaan value cusub la qorin.
   - Amount sida `0.01` lama beddeli doono; haddii `.` la diido, paste fallback ayaa la isku dayayaa.

5. **Stall-ka jooji**
   - Haddii verify-ku si buuxda u akhrin waayo field-ka laakiin field-ku muuqdo inuu xog hayo, scheduled submit-ka wuxuu wali riixi doonaa Send halkii uu istaagi lahaa.
   - Haddii field-ku madhan yahay, wuxuu dib u qori doonaa tiro xaddidan, kadibna wuxuu sameyn doonaa final write + Send si flow-gu uusan u istaagin.

6. **Logs cad oo isku mid ah**
   - Logs-ku waxay noqon doonaan hal qaab:
     - `USSD[step=n] WRITE value=...`
     - `USSD[step=n] VERIFY ok/fallback`
     - `USSD[step=n] SEND clicked/blocked/stale`
   - Tani waxay fududeynaysaa in videos/logs dambe si dhaqso ah loo fahmo.

## Faylka la taabanayo

- `android-app/app/src/main/kotlin/com/iftin/delivery/service/UssdAccessibilityService.kt`

Web app-ka, database-ka, iyo admin USSD flow data lama beddelayo.

## Xaqiijin

- Waxaan hubin doonaa in code-ku aanu lahayn `provider.contains("somnet")` ama branch shirkad-gaar ah.
- Waxaan hubin doonaa in scheduled submit-ku uusan mar dambe isku xannibin `awaitingScheduledSubmit`.
- Waxaan kuu sheegi doonaa in APK-ga laga dhiso GitHub Actions kadib isbeddelka.
