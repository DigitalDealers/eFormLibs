# Firebase API library for eForms project
###Requires such dependencies (should be installed manually):
1. @angular/fire
2. angular-2-local-storage
3. firebase
4. @digitaldealers/interceptors

###In your app module in imports section add configs for these modules:
1. AngularFireModule.initializeApp(...)
2. LocalStorageModule.forRoot(...)
3. DidiInterceptorsModule.forRoot({ authBaseUrl: ..., applicationId: ..., ... })
4. HttpClientModule
