# URL Shortner API
Small and highly configurable express.js API for shortening URLs.

## Prerequisites
Please ensure you do the following below before continuing to set up hosting for this project.
* Install the LTS version of [node.js](https://nodejs.org)
* Make a MongoDB database (you can make one for free on their [Atlas](https://mongodb.com))
* **Optional:** If you wish to enable link checking, register for a [Google SafeBrowsing API key](https://developers.google.com/safe-browsing)
## Self Hosting
* Clone this repository
```git
git clone https://github.com/airbus-a330/url-shortener
```
  * Navigate into `.env.example` and replace the values listed
  * Remove the file extension `.example` from `.env`
  * Navigate into `config.js` inside the `Config` folder
  * Change the values in that file as necessary
  * Install all packages
    ```
    npm install
    ```
  * Run the file
    ```bash
    node index.js
    ```

## Configuration
| **Property**                	| **Type** 	| **Description**                                                                                         	| **Default Value** 	|
|-----------------------------	|----------	|---------------------------------------------------------------------------------------------------------	|-------------------	|
| `id.length`                 	| Number   	| The length of the custom URL.                                                                           	| 8                 	|
| `url.allowMultipleEntries`  	| Boolean  	| Whether or not to allow multiple entries of a specific URL in the database.                             	| false             	|
| `url.checkLink`             	| Boolean  	| Whether or not to check the link for malware/phishing.                                                  	| true              	|
| `url.maximumRedirects`      	| Number   	| How many times the redirecting URL can redirect (i.e. nesting URL shortners)                            	| 3                 	|
| `url.retain`                	| Number   	| How long the shortened URL should be retained for (**time in `ms`**). Use `0` for indefinite retention. 	| 0                 	|
| `ratelimits.creation.limit` 	| Number   	| How many creations can occur within `x` milliseconds per IP                                             	| 5                 	|
| `ratelimits.creation.reset` 	| Number   	| When the ratelimit should be reset (in milliseconds).                                                   	| 15,000            	|
| `ratelimits.view.limit`     	| Number   	| How many times URLs can be viewed within `y` milliseconds per IP.                                       	| 5                 	|
| `ratelimits.view.reset`     	| Number   	| When the ratelimit should be reset (in milliseconds).                                                   	| 5,000             	|

## Usage
* Shortening a URL:
  * Make a `POST` request to `https://<base_url>/urls` with the body
  ```json
  { "url": "https://your_url.here" }
  ```
  * You will receive the following body (if successful):
  ```json
  {
    "status": 200,
    "message": "The shortened URL path has been successfully created!",
    "code": "<STRING_ID>",
    "retain": <INTEGER_RETENTION>
  }
  ```
* Visiting a shortened URL
  * Assuming the URL is not flagged and there are no additional errors, you will immediately be redirected to the website.
  * Make a `GET` request to `https://<base_url>/<url_id>`

## Contributing
All pull requests are welcome. Please be descriptive on your changes/additions and be respectful to the community in your pull request. Additionally, please make sure to test your code before submitting the pull request to ensure it works.

## Support
If you need help with this API (i.e. for self hosting), please feel free to make an issue.

### Thanks for using our URL Shortener!