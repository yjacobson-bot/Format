; Hebrew NSIS installer customization

!macro customHeader
!macroend

!macro customInit
  ; Override multiuser page strings to Hebrew
  LangString MULTIUSER_TEXT_INSTALLMODE_TITLE ${LANG_HEBREW} "אפשרויות התקנה"
  LangString MULTIUSER_TEXT_INSTALLMODE_SUBTITLE ${LANG_HEBREW} "עבור מי להתקין את $(^Name)?"
  LangString MULTIUSER_INSTALLMODE_ALLUSERS_TEXT ${LANG_HEBREW} "כל המשתמשים במחשב זה"
  LangString MULTIUSER_INSTALLMODE_CURRENTUSER_TEXT ${LANG_HEBREW} "רק עבורי"
  LangString MULTIUSER_INSTALLMODE_ALLUSERS_SUBTEXT ${LANG_HEBREW} "התקן עבור כולם (נדרשות הרשאות מנהל)"
  LangString MULTIUSER_INSTALLMODE_CURRENTUSER_SUBTEXT ${LANG_HEBREW} "התקן רק למשתמש הנוכחי"
!macroend

!macro customInstall
  CreateShortCut "$DESKTOP\פורמט נקי.lnk" "$INSTDIR\פורמט נקי.exe" "" "$INSTDIR\פורמט נקי.exe" 0
  CreateDirectory "$SMPROGRAMS\פורמט נקי"
  CreateShortCut "$SMPROGRAMS\פורמט נקי\פורמט נקי.lnk" "$INSTDIR\פורמט נקי.exe" "" "$INSTDIR\פורמט נקי.exe" 0
  CreateShortCut "$SMPROGRAMS\פורמט נקי\הסר התקנה.lnk" "$INSTDIR\Uninstall פורמט נקי.exe"
!macroend

!macro customUnInstall
  Delete "$DESKTOP\פורמט נקי.lnk"
  Delete "$SMPROGRAMS\פורמט נקי\פורמט נקי.lnk"
  Delete "$SMPROGRAMS\פורמט נקי\הסר התקנה.lnk"
  RMDir "$SMPROGRAMS\פורמט נקי"
!macroend
