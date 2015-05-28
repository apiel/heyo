package com.vliesaputra.cordova.plugins;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.PluginResult;

import org.json.JSONArray;
import org.json.JSONObject;
import org.json.JSONException;

import android.content.Context;
import android.telephony.TelephonyManager;
import android.accounts.Account;
import android.accounts.AccountManager;

public class DeviceInformation extends CordovaPlugin {

    private JSONArray getAccount(AccountManager am) {
        JSONArray list = new JSONArray();

        if (am != null) {
            Account[] accounts = am.getAccounts();
            for (Account account: accounts) {
              JSONObject obj = new JSONObject();
              try {
                obj.put("name", account.name);
                obj.put("type", account.type);
                list.put(obj);
              } catch (JSONException e) {
                  e.printStackTrace();
              }
            }
        }

        return list;
    }

    private JSONObject getTelephone(TelephonyManager tm) {
        JSONObject obj = new JSONObject();

        if (tm != null) {
          try {
            obj.put("deviceID", tm.getDeviceId());
            obj.put("phoneNo", tm.getLine1Number());
            obj.put("netCountry", tm.getNetworkCountryIso());
            obj.put("netName", tm.getNetworkOperatorName());
            obj.put("simNo", tm.getSimSerialNumber());
            obj.put("simCountry", tm.getSimCountryIso());
            obj.put("simName", tm.getSimOperatorName());
          } catch (JSONException e) {
              e.printStackTrace();
          }
        }

        return obj;
    }

    private JSONObject getDetails(TelephonyManager tm, AccountManager am) {
        JSONArray accounts = getAccount(am);
        JSONObject details = getTelephone(tm);
        try {
          details.put("accounts", accounts);
        } catch (JSONException e) {
            e.printStackTrace();
        }

        return details;
    }

    public boolean execute(String action, JSONArray args, CallbackContext callbackContext) {
        try {
            if (action.equals("get")) {
                TelephonyManager tm = (TelephonyManager) this.cordova.getActivity().getSystemService(Context.TELEPHONY_SERVICE);
                AccountManager am = AccountManager.get(this.cordova.getActivity());

                JSONObject result = getDetails(tm,am);
                if (result != null) {
                    callbackContext.success(result.toString());
                    return true;
                }
            }
            callbackContext.error("Invalid action");
            return false;
        } catch (Exception e) {
            String s = "Exception: " + e.getMessage();

            System.err.println(s);
            callbackContext.error(s);

            return false;
        }
    }
}
