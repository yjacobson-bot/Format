; Hebrew NSIS installer customization
!macro customHeader
  ; Force Hebrew as the only installer language
  !define MUI_LANGDLL_ALLLANGUAGES
  !insertmacro MUI_LANGUAGE "Hebrew"

  ; Hebrew text overrides for multiuser mode selection page
  !define MULTIUSER_TEXT_INSTALLMODE_TITLE "אפשרויות התקנה"
  !define MULTIUSER_TEXT_INSTALLMODE_SUBTITLE "עבור מי להתקין את $(^Name)?"
  !define MULTIUSER_INSTALLMODE_ALLUSERS_TEXT "כל המשתמשים במחשב זה"
  !define MULTIUSER_INSTALLMODE_CURRENTUSER_TEXT "רק עבורי"
  !define MULTIUSER_INSTALLMODE_ALLUSERS_SUBTEXT "התקן עבור כולם (נדרשות הרשאות מנהל)"
  !define MULTIUSER_INSTALLMODE_CURRENTUSER_SUBTEXT "התקן רק למשתמש הנוכחי"

  ; Hebrew page titles
  !define MUI_PAGE_HEADER_TEXT "ברוכים הבאים למתקין פורמט נקי"
  !define MUI_PAGE_HEADER_SUBTEXT "בחר את תיקיית ההתקנה"
  !define MUI_DIRECTORYPAGE_TEXT_TOP "בחר את התיקייה שבה תרצה להתקין את $(^Name)."
  !define MUI_DIRECTORYPAGE_TEXT_DESTINATION "תיקיית יעד"
  !define MUI_FINISHPAGE_TITLE "התקנת $(^Name) הושלמה"
  !define MUI_FINISHPAGE_TEXT "$(^Name) הותקנה בהצלחה על המחשב שלך."
  !define MUI_FINISHPAGE_RUN_TEXT "הפעל את $(^Name) עכשיו"
!macroend

!macro customInstall
  ; Create desktop shortcut explicitly in Hebrew
  CreateShortCut "$DESKTOP\פורמט נקי.lnk" "$INSTDIR\פורמט נקי.exe" "" "$INSTDIR\פורמט נקי.exe" 0
  ; Create Start Menu shortcut
  CreateDirectory "$SMPROGRAMS\פורמט נקי"
  CreateShortCut "$SMPROGRAMS\פורמט נקי\פורמט נקי.lnk" "$INSTDIR\פורמט נקי.exe" "" "$INSTDIR\פורמט נקי.exe" 0
  CreateShortCut "$SMPROGRAMS\פורמט נקי\הסר התקנה.lnk" "$INSTDIR\Uninstall פורמט נקי.exe"
!macroend

!macro customUnInstall
  ; Remove shortcuts on uninstall
  Delete "$DESKTOP\פורמט נקי.lnk"
  Delete "$SMPROGRAMS\פורמט נקי\פורמט נקי.lnk"
  Delete "$SMPROGRAMS\פורמט נקי\הסר התקנה.lnk"
  RMDir "$SMPROGRAMS\פורמט נקי"
!macroend
