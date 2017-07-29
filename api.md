# API Docs

This documentation is incomplete. Check `./flux/routes.py` for endpoints.

Domains:

`flux-api-dev.herokuapp.com` is the domain for the development version of the api

`api.voteflux.org` is the prod version. ALWAYS USE `https`.

## Versioning

Some v0 calls can be made without including `/api/v0`, eg: `/getinfo` works (also `/api/v0/getinfo` ofc). However, from now on `/api/v0` should
always be included.

## Rate Limiting

Some API calls are rate limited. They will return status 429 if requests exceed the limit.

## User Calls

### User Objects

User objects are basically returned as they're stored in the DB. Fields are pretty much optional, though some are guaranteed to be there.

Fields settable by the user: (see `./flux/security.py`)

```
user_fields = [
    'username',
    'email',
    'name',
    'address',
    'valid_regions',
    'dob',
    'contact_number',
    'member_comment',
    'referred_by',
    'onAECRoll',
    'dobDay',
    'dobMonth',
    'dobYear',
    'addr_postcode',  # introduced 16/4/16 to support new addr format / autofill
    'addr_version',
    'addr_street',
    'addr_suburb',
    'fname',
    'mnames',
    'sname',
]
```

Fields that *will* be there are: `detailsValid, needsValidating, doubleCheckedValidation, s, email`

The `s` field is the secret token.

Example user object:

```
{
    "onAECRoll":true,
    "valid_regions":['AUS'],
    "name":"Max Kaye",
    "dobDay":"1",
    "address":"50 Foo Ln\nFooTown\nNSW, 2000",
    "dobMonth":"1",
    "username":"flux-membership-robot@xk.io",
    "set_password":false,
    "detailsValid":true,
    "doubleCheckedValidation":true,
    "contact_number":"402713219",
    "password":"b33a295a86494a78695533f633c7e961db07f402",
    "email":"flux-membership-robot@xk.io",
    "_id":{"$oid":"56a325e0a7ab0000035bb07c"},
    "dob":"1990-01-01T00:09:50.115Z",
    "s":"163d0d6ddb97ace705f68f0c55b9c93dfbf94fa8",
    "member_comment":"",
    "needsValidating":false,
    "dobYear":"1990",
    "referred_by":"",
    "timestamp":1430250710,
    "$$hashKey":"object:1019"
}
```

Some fields don't matter, like `password` though they might be used later. `password` would ofc be hashed; whereas `s` is just a secret token.

If you POST back a user object the editable fields will be updated, but fields like 'needsValidating' will be reset.

### `/api/v0/register/initial_email`, `POST`

Expects:

```
{
    'email': 'email@test.com',
    'fname': 'someFirstname'
}
```

returns user object

### `/api/v0/register/all_at_once`, `POST`

This expects a more full user object. EG: (this is incomplete and more detail should be provided)

```
{
    "onAECRoll":true,
    "valid_regions":['AUS'],
    "name":"Max foo bar Kaye",
    "fname": "Max",
    "mnames": "foo bar",
    "sname": "Kaye",
    "dobDay":"1",
    "address":"50 Foo Ln; FooTown; 2000; Australia",
    "addr_street": "50 Foo Ln",
    "addr_suburb": "FooTown",
    "addr_postcode": "2000",
    "addr_country": "Australia",
    "dobMonth":"1",
    "username":"flux-membership-robot@xk.io",
    "contact_number":"402713219",
    "email":"flux-membership-robot@xk.io",
    "dob":"1990-01-01T00:09:50.115Z",
    "member_comment":"",
    "dobYear":"1990",
    "referred_by":"",
}
```

Returns user object.

When submitting, take fields as on the right of these assignments, and assign as denoted on the left:

```
toSubmit['name'] = _.join(' ', [fname, mnames, sname]);
toSubmit['address'] = _.join('; ', [addr_street, addr_suburb, addr_postcode, addr_country]);
```

### `/api/v0/user_details`, `POST`

All requests need the `s` param which will be authenticated. Else `403` returned if `s` doesn't validate.

If sending a dict with only the `s` key then the user object will be returned.

If you post a user object then we update the user record with those fields.


### `/api/v0/email_secret_token`, `POST`

Post a dict with an `email` param.

Returns:

```
{
    'sent_email': {true,false},
    'reason': 'Email Sent' or 'Email not found', etc
}
```

`reason` can be show to the user as an error msg.

## Stats

### `/api/v0/getinfo`, `GET`

Example:

```
{
    "validation_queue": 819,
    "n_members": 1545,
    "_id": {"$oid": "571314e427007d5b703fc031"},
    "last_member_signup": 1461192453.549169,
    "id": 1,
    "double_check_queue": 8,
    "double_checked": 543,
    "n_members_validated": 551
}
```

### `/api/v0/public_stats`, `GET`

Fields:

* `signup_times` -> array of timestamps
* `dob_years` -> dict of years to count
* `postcodes` -> dict of postcodes to count
* `last_run` -> timestamp last time stats were run
* `state_dob_years` -> dict of state to count in form of `dob_years`
* `states` -> dict of states to count

## Polling stuff

### `/api/v0/iiccot/cast_vote`

Submit a request like:

```
{
    "s": "adc596468c0c950f2a06ad4d5d92c0b81a0bf0dd",
    "poll_id": 1,
    "option_id": "105"
}
```

`poll_id` should always be 1 for IICCOT

`option_id` should be a string in [100 .. 107] inclusive. (We can add more options if need be)

`s` is the member secret; which you get back on a successful registration, and members will be emailed a link with a `?s=adc596468c0c950f2a06ad4d5d92c0b81a0bf0dd` `GET` param.

### `/api/v0/iiccot/getinfo`

Returns something like:

```
{
    "_id": {"$oid": "576b750f7416d719963f1f11"},
    "stats": {
        "101": 0,
        "100": 0,
        "103": 0,
        "105": 1,
        "104": 0,
        "106": 0,
        "102": 0,
        "107": 0
    },
    "poll_id": 1
}
```

With numbers for votes for each option.

### `/api/v0/give_admin_role`

### `/api/v0/give_role`

### `/api/v0/phone_bank/get_next_member` (DRAFT)

respects `user.do_not_call`

Query:

```
{
    "s": "012345...",  // requesting users token
    "state": "nsw",  //optional
    "no_answered_call_since": 604800  // seconds, 604800 = 1 week
    "no_any_call_since": 604800  // second, included to allow re-calling ppl that didn't pick up
}
```

Response:

```
{
    "name": "mike john canningtonberry",
    "contact_number": "009992934944",
    "postcode": 1234,
    "call_log": [{call_log_document}],  // list of some yet to be designed objects
    "call_id": 123445666  // generated upon request
}
```

### `/api/v0/phone_bank/report` (DRAFT)

Query:

```
{
    "s": "0000000....",  // user's token
    "call_id": 123445666,
    "do_not_call": false,  // set to true to update user profile
    "comment": "some text field",  //
}
```

### GET `/api/v0/get_suburbs/COUNTRY/POSTCODE`

Url example: `/api/v0/get_suburbs/au/2001`

Returns:
`{"suburbs": ["DARWIN (NT)"], "status": "okay"}`

### GET `/api/v0/get_streets/COUNTRY/POSTCODE/SUBURB`

Url example: `/api/v0/get_streets/au/0800/DARWIN%20(NT)`

Returns:

```
{
    "streets": ["ANCHORAGE CT", ... "WOODS ST"],
    "status": "okay"
}
```

## Phone Verification

### POST `/api/v1/app_rego/phone_commit`

#### WARNING: This call is rate limited

Post Body:

```json
{
    "phone_number": "+61412345678",
}
```

Returns `{'status':'okay'}` or HTTP error code

### POST `/api/v1/app_rego/phone_verify`

Post Body:

NB: verify_code is a string

```json
{
    "phone_number": "+61412345678",
    "verify_code": "123456",
    "verify_nonce": "something random 297494"
}
```

Response is a JSON doc with either a ``'status': 'okay'` or `'error': 'msg'` field.
If the `'error'` key exists then there's an error.

later in the rego process you will need to provide `phone_verify_nonce again`;
this is to prevent someone illegitimately signing up with your phone number in a timing attack.
It should be (securely) randomly generated.

### POST `/api/v1/app/new_magic_link`

Body: `{'email': 'users@email.com'}`

Response: `{'status': 'okay'}` or `{'error': 'email not found'}`

Will send the email with `fluxapp://sign_in/magic_link/<token>` URI

### GET `/api/v1/app/login_magic_link/<token>`

Response:

```
{
    "status": "okay",
    "s": "<SECRET TOKEN>",
    "user": { ... full user doc ... }
}
```

### POST `/api/v1/app/feedback`

Body: `{'s': <token>, 'feedback': 'FEEDBACK HERE'}`

response: `{'status': 'okay'}` or `{"error": "You've submitted too much feedback!"}`
