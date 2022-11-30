const axios = require('axios')
const message = require('../config/message');

exports.deliveryCreate = async(req,res,next) => {
    try {
        let postData = 
        {
            "type": "LMD",
            "pickup": {
                "coordinate": {
                    "latitude": 25.0898,
                    "longitude": 55.1528
                },
                "area": "Media City",
                "building_name": "Al-Shatha Tower",
                "city": "Dubai",
                "street": "Al-Sufouh",
                "notes": "Careem Office"
            },
            "dropoff": {
                "coordinate": {
                    "latitude": 25.0898,
                    "longitude": 55.1528
                },
                "area": "Media City",
                "building_name": "Al-Shatha Tower",
                "city": "Dubai",
                "street": "Al-Sufouh",
                "notes": "Careem Office"
            },
            "driver_notes": "Call after reaching.",
            "customer": {
                "name": "John Doe",
                "phone_number": "1234567"
            },
            "outlet": {
                "name": "string",
                "phone_number": "string"
            },
            "cash_collection": {
                "amount": 0
            },
            "order": {
                "reference": "string"
            }
        }

        const resp = await axios.post('https://sagateway.careem-engineering.com/b2b/deliveries', postData);
        console.log(resp.data);
    }
    catch(error) {
        console.log("error",error);
        res.status(400).json({
            status:message.messages.FALSE,
            message:error.message
        })
    }
}