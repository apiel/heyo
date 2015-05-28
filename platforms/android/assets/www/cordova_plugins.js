cordova.define('cordova/plugin_list', function(require, exports, module) {
module.exports = [
    {
        "file": "plugins/com.phonegap.plugins.PushPlugin/www/PushNotification.js",
        "id": "com.phonegap.plugins.PushPlugin.PushNotification",
        "clobbers": [
            "PushNotification"
        ]
    },
    {
        "file": "plugins/com.vliesaputra.deviceinformation/www/deviceinformation.js",
        "id": "com.vliesaputra.deviceinformation.DeviceInformation",
        "clobbers": [
            "cordova.plugins.deviceInformation"
        ]
    }
];
module.exports.metadata = 
// TOP OF METADATA
{
    "com.phonegap.plugins.PushPlugin": "2.4.0",
    "com.vliesaputra.deviceinformation": "1.0.1"
}
// BOTTOM OF METADATA
});