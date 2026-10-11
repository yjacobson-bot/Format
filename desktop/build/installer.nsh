; Hebrew NSIS installer customization
; Note: language is set to Hebrew (1037) via package.json nsis.language
; Do NOT call !insertmacro MUI_LANGUAGE here — electron-builder handles it

!macro customHeader
  ; Hebrew text overrides for multiuser mode selection page
  !define MULTIUSER_TEXT_INSTALLMODE_TITLE "אפשרויות התקנה"
  !define MULTIUSER_TEXT_INSTALLMODE_SUBTITLE "עבור מי להתקין את $(^Name)?"
  !define MULTIUSER_INSTALLMODE_ALLUSERS_TEXT "כל המשתמשים במחשב זה"
  !define MULTIUSER_INSTALLMODE_CURRENTUSER_TEXT "רק עבורי"
  !define MULTIUSER_INSTALLMODE_ALLUSERS_SUBTEXT "התקן עבור כולם (נדרשות הרשאות מנהל)"
  !define MULTIUSER_INSTALLMODE_CURRENTUSER_SUBTEXT "התקן רק למשתמש הנוכחי"
!macroend

!macro customInstall
  ; Create desktop shortcut with Hebrew name
  CreateShortCut "$DESKTOP\פורמט נקי.lnk" "$INSTDIR\פורמט נקי.exe" "" "$INSTDIR\פורמט נקי.exe" 0
  ; Create Start Menu folder and shortcut
  CreateDirectory "$SMPROGRAMS\פורמט נקי"
  CreateShortCut "$SMPROGRAMS\פורמט נקי\פורמט נקי.lnk" "$INSTDIR\פורמט נקי.exe" "" "$INSTDIR\פורמט נקי.exe" 0
  CreateShortCut "$SMPROGRAMS\פורמט נקי\הסר התקנה.lnk" "$INSTDIR\Uninstall פורמט נקי.exe"
!macroend

!macro customUnInstall
  ; Remove Hebrew-named shortcuts on uninstall
  Delete "$DESKTOP\פורמט נקי.lnk"
  Delete "$SMPROGRAMS\פורמט נקי\פורמט נקי.lnk"
  Delete "$SMPROGRAMS\פורמט נקי\הסר התקנה.lnk"
  RMDir "$SMPROGRAMS\פורמט נקי"
!macroend
