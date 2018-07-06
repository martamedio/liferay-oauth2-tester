# Liferay OAuth2 Tester

HTML and Javascript utility to test OAuth 2.0 integration on **Liferay**, built with _jQuery 3.1.1_ and _Bootstrap 4.1.1_

You can follow the official documentation to create and manage OAuth2 Applications [here](https://dev.liferay.com/es/discover/deployment/-/knowledge_base/7-1/oauth-2-0 "Liferay Documentation")

### How to use the Liferay OAuth 2.0 Tester application

1. Start Liferay Portal
2. Register a new OAuth2 application and set as callback: `http://DEPLOYMENT_OF_THIS_UTILITY/?url=YOUR_LIFERAY_URL&client_id=YOUR_CLIENT_ID`
3. Add a Scope to the new application
4. Access to the utility and fill out the form for "_Obtain Liferay Authorization_"
5. Click on "_Authorize My Application_"
6. You will receive an authorization code, then the application can use to exchange for an access token
7. Fill out the form for "_Obtain OAuth2 Token_"
7. You should get back an access token
8. You can launch API requests and also test the "_Refresh Token_" funcionality

Deployed at: http://martamedio.com/oauth2-tester/