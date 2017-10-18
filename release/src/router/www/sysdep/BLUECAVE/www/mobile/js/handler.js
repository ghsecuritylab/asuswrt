var apply = {};

apply.welcome = function(){
	if($("#tosCheckbox").is(":visible")){
		if(systemVariable.isDefault && !$("#tosCheckbox").prop("checked") && isSupport("LYRA")){
			$("html, body").animate({ scrollTop: $(document).height()}, 800);
			$(".tos").fadeOut(500).fadeIn(500).fadeOut(500).fadeIn(500);
			return false;
		}
	}

	if(!systemVariable.forceChangePW){
		if(!systemVariable.isDefault){
			if(isOriginSwMode("RP")){
				goTo.rpMode();
			}
			else if(isOriginSwMode("AP")){
				goTo.apMode();
			}
			else if(isOriginSwMode("MB")){
				goTo.mbMode();
			}
			else if(isOriginSwMode("Mesh")){
				goTo.meshMode();
			}
			else{
				goTo.autoWan();
			}
		}
		else{
			goTo.autoWan();
		}
	}
	else{
		goTo.Login();
	}
};

apply.login = function(){
	if(hasBlank([$("#http_username"), $("#http_passwd"), $("#http_passwd_confirm")])) return false;

	var validForm = function(){
		var getTrimString = function(val){
			val = val+'';
			for (var startIndex=0;startIndex<val.length && val.substring(startIndex,startIndex+1) == ' ';startIndex++);
			for (var endIndex=val.length-1; endIndex>startIndex && val.substring(endIndex,endIndex+1) == ' ';endIndex--);
			return val.substring(startIndex,endIndex+1);
		}

		if($("#http_username").val() == 0){
			$("#http_username").showTextHint("<#File_Pop_content_alert_desc1#>");
			document.getElementById("http_username").focus();
			document.getElementById("http_username").select();
			return false;
		}
		else{
			var alert_str = validator.hostName(document.getElementById("http_username"));

			if(alert_str != ""){
				$("#http_username").showTextHint(alert_str);
				document.getElementById("http_username").focus();
				document.getElementById("http_username").select();
				return false;
			}

			document.getElementById("http_username").value = getTrimString(document.getElementById("http_username").value);

			if(document.getElementById("http_username").value == "root"
			|| document.getElementById("http_username").value == "guest"
			|| document.getElementById("http_username").value == "anonymous"){
				$("#http_username").showTextHint("<#USB_Application_account_alert#>");
				document.getElementById("http_username").focus();
				document.getElementById("http_username").select();
				return false;
			}
		}

		var httpPassInput = document.getElementById("http_passwd");
		var httpPassConfirmInput = document.getElementById("http_passwd_confirm");

		if(httpPassInput.value != httpPassConfirmInput.value){
			$("#http_passwd").showTextHint("<#File_Pop_content_alert_desc7#>");

			if(httpPassInput.value.length <= 0){
				httpPassInput.focus();
				httpPassInput.select();
			}else{
				httpPassConfirmInput.focus();
				httpPassConfirmInput.select();
			}
			return false;
		}

		if(httpPassInput.value.length <= 0 || httpPassConfirmInput.value.length <= 0){
			$("#http_passwd").showTextHint("<#File_Pop_content_alert_desc6#>");
			httpPassInput.focus();
			httpPassInput.select();
			return false;
		}

		if(httpPassInput.value.length > 0 && httpPassConfirmInput.value.length < 5){
			$("#http_passwd").showTextHint("<#JS_short_password#>");
			httpPassInput.focus();
			httpPassInput.select();
			return false;
		}

		if(!validator.string(httpPassInput)){
			httpPassInput.focus();
			httpPassInput.select();
			return false;
		}	

		if(httpPassInput.value == systemVariable.default_http_passwd){
			$("#http_passwd").showTextHint("<#QIS_adminpass_confirm0#>");
			httpPassInput.focus();
			httpPassInput.select();
			return false;
		}	

		if(isWeakString(httpPassInput.value, "httpd_password")){
			if(!confirm("<#JS_common_passwd#>")){
				httpPassInput.focus();
				httpPassInput.select();
				return false;
			}
		}

		return true;
	}

	if(validForm()){
		qisPostData.http_username = $("#http_username").val();
		qisPostData.http_passwd = $("#http_passwd").val();

		if(isOriginSwMode("RP")){
			goTo.rpMode();
		}
		else if(isOriginSwMode("AP")){
			goTo.apMode();
		}
		else if(isOriginSwMode("MB")){
			goTo.mbMode();
		}
		else if(isOriginSwMode("Mesh")){
			goTo.meshMode();
		}
		else{
			goTo.autoWan();
		}
	}
};

apply.waiting = function(){
	postDataModel.insert(opModeObj);
	qisPostData.sw_mode = 1;
	qisPostData.wlc_psta = 0;

	systemVariable.manualWANSetup = true;

	if(systemVariable.isDefault)
		goTo.loadPage("opMode_page", false);
	else
		goTo.WAN()
};

apply.dhcp = function(){
	if($("#iptv_checkbox").is(":checked")){
		goTo.IPTV();
	}
	else if(hadPlugged("modem")){
		goTo.Modem();
	}
	else{
		if(isWANChanged()){
			httpApi.nvramSet((function(){
				qisPostData.action_mode = "apply";
				qisPostData.rc_service = "restart_wan";
				return qisPostData;
			})());
		}

		goTo.Wireless();
	}
};

apply.pppoe = function(){
	if(qisPostData.wan_proto === "l2tp" || qisPostData.wan_proto === "pptp"){
		if(hasBlank([$("#wan_pppoe_username"), $("#wan_pppoe_passwd"), $("#wan_heartbeat_x")])) return false;

		qisPostData.wan_pppoe_username = $("#wan_pppoe_username").val();
		qisPostData.wan_pppoe_passwd = $("#wan_pppoe_passwd").val();
		qisPostData.wan_heartbeat_x = $("#wan_heartbeat_x").val();

		goTo.GetIp();
	}
	else{
		if(qisPostData.hasOwnProperty("wan_pppoe_username")){
			if(hasBlank([$("#wan_pppoe_username"), $("#wan_pppoe_passwd")])) return false;		
			qisPostData.wan_pppoe_username = $("#wan_pppoe_username").val();
			qisPostData.wan_pppoe_passwd = $("#wan_pppoe_passwd").val();
		}

		if($("#iptv_checkbox").is(":checked")){
			goTo.IPTV();
		}
		else if(hadPlugged("modem")){
			goTo.Modem();
		}
		else{
			if(isWANChanged()){
				httpApi.nvramSet((function(){
					qisPostData.action_mode = "apply";
					qisPostData.rc_service = "restart_wan";
					return qisPostData;
				})());
			}
	
			goTo.Wireless();
		}
	}
};

apply.static = function(){
	if(qisPostData.hasOwnProperty("wan_ipaddr_x")){
		if(hasBlank([
			$("#static_ipaddr"), 
			$("#static_subnet"), 
			$("#static_gateway"),
			$("#static_dns1")
		])) return false;

		qisPostData.wan_dhcpenable_x = "0";
		qisPostData.wan_ipaddr_x = $("#static_ipaddr").val()
		qisPostData.wan_netmask_x = $("#static_subnet").val()
		qisPostData.wan_gateway_x = $("#static_gateway").val()
		qisPostData.wan_dnsenable_x = "0";
		qisPostData.wan_dns1_x = $("#static_dns1").val();
		qisPostData.wan_dns2_x = $("#static_dns2").val();
	}

	if($("#iptv_checkbox").is(":checked")){
		goTo.IPTV();
	}
	else if(hadPlugged("modem")){
		goTo.Modem();
	}
	else{
		if(isWANChanged()){
			httpApi.nvramSet((function(){
				qisPostData.action_mode = "apply";
				qisPostData.rc_service = "restart_wan";
				return qisPostData;
			})());
		}
	
		goTo.Wireless();
	}
};

apply.iptv = function(){
	if(qisPostData.switch_wantag == "movistar"){
		if(hasBlank([
			$("#iptv_ipaddr"), 
			$("#iptv_netmask"), 
			$("#iptv_gateway"),
			$("#iptv_dns1")
		])) return false;

		qisPostData.wan10_ipaddr_x = $("#iptv_ipaddr").val();
		qisPostData.wan10_netmask_x = $("#iptv_netmask").val();
		qisPostData.wan10_gateway_x = $("#iptv_gateway").val();
		qisPostData.wan10_dns1_x = $("#iptv_dns1").val();
		qisPostData.wan10_dns2_x = $("#iptv_dns2").val();
		qisPostData.wan10_auth_x = $("#iptv_auth_mode").val();
		qisPostData.wan10_pppoe_username = $("#iptv_pppoe_username").val();
		qisPostData.wan10_pppoe_passwd = $("#iptv_pppoe_passwd").val();
	}
	else if(qisPostData.switch_wantag == "manual"){
		if(hasBlank([
			$("#internet_vid"), 
			$("#internet_prio"), 
			$("#stb_vid"),
			$("#stb_prio"),
			$("#voip_vid"),
			$("#voip_prio")
		])) return false;

		qisPostData.switch_wan0tagid = $("#internet_vid").val();
		qisPostData.switch_wan0prio = $("#internet_prio").val();
		qisPostData.switch_wan1tagid = $("#stb_vid").val();
		qisPostData.switch_wan1prio = $("#stb_prio").val();
		qisPostData.switch_wan2tagid = $("#voip_vid").val();
		qisPostData.switch_wan2prio = $("#voip_prio").val();
	}

	if(hadPlugged("modem")){
		goTo.Modem();
	}
	else{
		goTo.Wireless();
	}
};

apply.modem = function(){
	if(qisPostData.modem_autoapn == "1"){
		if(hasBlank([
			$("#modem_dialnum"), 
			$("#modem_user"), 
			$("#modem_pass")
		])) return false;			
	}

	qisPostData.wans_dualwan = "wan usb";
	qisPostData.modem_enable = $("#modem_enable").val();
	qisPostData.modem_android = $("#modem_android").val();
	qisPostData.modem_autoapn = $("#modem_autoapn").val();
	qisPostData.modem_country = $("#modem_country").val();
	qisPostData.modem_isp = $("#modem_isp").val();
	qisPostData.modem_apn = $("#modem_apn").val();
	qisPostData.modem_dialnum = $("#modem_dialnum").val();
	qisPostData.modem_pincode = $("#modem_pincode").val();
	qisPostData.modem_user = $("#modem_user").val();
	qisPostData.modem_pass = $("#modem_pass").val();
	qisPostData.modem_ttlsid = $("#modem_ttlsid").val();
	qisPostData.modem_authmode = $("#modem_authmode").val();
	qisPostData.modem_mtu = $("#modem_mtu").val();
	qisPostData.Dev3G = $("#Dev3G").val();

	goTo.Wireless();
};

apply.lanStatic = function(){
	if(qisPostData.hasOwnProperty("lan_proto")){
		if(hasBlank([
			$("#static_lan_ipaddr"), 
			$("#static_lan_subnet"), 
			$("#static_lan_gateway"),
			$("#static_lan_dns1")
		])) return false;

		qisPostData.lan_proto = "static";
		qisPostData.lan_ipaddr = $("#static_lan_ipaddr").val()
		qisPostData.lan_netmask = $("#static_lan_subnet").val()
		qisPostData.lan_gateway = $("#static_lan_gateway").val()
		qisPostData.lan_dnsenable_x = "0";
		qisPostData.lan_dns1_x = $("#static_lan_dns1").val();
		qisPostData.lan_dns2_x = $("#static_lan_dns2").val();
	}
	
	if(isSwMode("MB")){
		httpApi.nvramSet((function(){
			qisPostData.action_mode = "apply";
			qisPostData.rc_service = getRestartService();
			return qisPostData;
		})(), goTo.Finish);
	}
	else{
		goTo.Wireless();
	}
};

apply.wlcKey = function(){
	if(hasBlank([$("#wlc_wifiKey")])) return false;

	if(systemVariable.selectedAP.encryption == "WEP"){
		var wepKey = $("#wlc_wifiKey").val();

		if(wepKey.length !== 5 && wepKey.length !== 10 && wepKey.length !== 13 && wepKey.length !== 26){
			$("#wlc_wifiKey").showTextHint("<#JS_wepkey#>");
			return false;
		}

		qisPostData.wlc_key	= 1;
		qisPostData.wlc_wep_key = wepKey;
		qisPostData.wlc_wep = (wepKey.length < 11) ? "1" : "2";
	}
	else{
		if(!validator.psk(document.getElementById("wlc_wifiKey"))) return false;
		qisPostData.wlc_wpa_psk = $("#wlc_wifiKey").val();
	}

	goTo.GetLanIp();
}

apply.wireless = function(){
	var wirelessValidator = function(band){
		if(hasBlank([$("#wireless_ssid_" + band), $("#wireless_key_" + band)])) return false;
		if(!validator.stringSSID(document.getElementById("wireless_ssid_" + band))) return false;
		if(!validator.psk(document.getElementById("wireless_key_" + band))) return false;	
		if(isWeakString($("#wireless_key_" + band).val(), "wpa_key")){if(!confirm("<#JS_common_passwd#>")) return false;}

		return true;
	}

	if(qisPostData.hasOwnProperty("wl0_ssid")){
		if($("#wireless_ssid_0").length){if(!wirelessValidator(0)) return false;}

		qisPostData.wl0_ssid = $("#wireless_ssid_0").val();
		qisPostData.wl0_wpa_psk = $("#wireless_key_0").val();
		qisPostData.wl0_auth_mode_x = "psk2";
		qisPostData.wl0_crypto = "aes";
	}

	if(qisPostData.hasOwnProperty("wl1_ssid")){
		if($("#wireless_ssid_1").length){if(!wirelessValidator(1)) return false;}

		qisPostData.wl1_ssid = ($("#wireless_ssid_1").length) ? $("#wireless_ssid_1").val() : qisPostData.wl0_ssid;
		qisPostData.wl1_wpa_psk = ($("#wireless_key_1").length) ? $("#wireless_key_1").val() : qisPostData.wl0_wpa_psk;
		qisPostData.wl1_auth_mode_x = "psk2";
		qisPostData.wl1_crypto = "aes";
	}

	if(qisPostData.hasOwnProperty("wl2_ssid")){
		if($("#wireless_ssid_2").length){if(!wirelessValidator(2)) return false;}

		qisPostData.wl2_ssid = ($("#wireless_ssid_2").length) ? $("#wireless_ssid_2").val() : qisPostData.wl0_ssid;
		qisPostData.wl2_wpa_psk = ($("#wireless_key_2").length) ? $("#wireless_key_2").val() : qisPostData.wl0_wpa_psk;
		qisPostData.wl2_auth_mode_x = "psk2";
		qisPostData.wl2_crypto = "aes";
	}

	if(qisPostData.hasOwnProperty("wlc_ssid")){
		var wlcUnit = systemVariable.selectedAP.unit;
		Object.keys(qisPostData).forEach(function(key){
			qisPostData[key.replace("wl" + wlcUnit, "wl" + wlcUnit + ".1")] = qisPostData[key];
		})

		postDataModel.remove(wirelessObj["wl" + wlcUnit]);
	}

	if(!systemVariable.isNewFw){
		httpApi.nvramSet((function(){
			qisPostData.action_mode = "apply";
			qisPostData.rc_service = getRestartService();
			return qisPostData;
		})(), goTo.Finish);
	}
	else{
		httpApi.nvramSet((function(){
			qisPostData.action_mode = "apply";
			qisPostData.rc_service = "saveNvram";
			return qisPostData;
		})(), goTo.Update);
	}
};

apply.update = function(){
	httpApi.nvramSet({"action_mode": "apply", "rc_service":"start_webs_upgrade"}, goTo.Upgrading);
};

apply.checkAddMore = function(){
	goTo.WPS();
}


var abort = {};

abort.login = function(){
	postDataModel.remove(userObj);
	goTo.loadPage("welcome", true);
};

abort.eula = function(){
	goTo.loadPage("welcome", true);
};

abort.opMode = function(){
	postDataModel.remove(opModeObj);

	setTimeout(function(){
		systemVariable.detwanResult = httpApi.detwanGetRet();
		switch(systemVariable.detwanResult.wanType){
			case "DHCP":
				goTo.DHCP();
				break;
			case "PPPoE":
				goTo.PPPoE();
				break;
			case "Static":
				goTo.Static();
				break;
			default:
				if(isPage("noWan_page")) setTimeout(arguments.callee, 1000);
				break;
		}
	}, 500);

	if(location.search == "?flag=manual"){
		window.history.back();
	}
	else{
		goTo.loadPage("noWan_page", true);
	}
}

abort.wan = function(){
	postDataModel.remove(wanObj.all);

	if(systemVariable.manualWANSetup){
		systemVariable.manualWANSetup = false;

		if(!systemVariable.forceChangePW)
			goTo.loadPage("welcome", true);
		else
			goTo.loadPage("login_name", true);	
	}
	else if(systemVariable.detwanResult.wanType == "NOWAN"){
		if(systemVariable.isDefault)
			goTo.loadPage("opMode_page", true);
		else
			goTo.loadPage("noWan_page", true);	
	}
	else{
		goTo.loadPage("welcome", true);		
	}
};

abort.nowan = function(){
	if(!systemVariable.forceChangePW)
		goTo.loadPage("welcome", true);
	else
		goTo.loadPage("login_name", true);
};

abort.modem = function(){
	postDataModel.remove(modemObj);

	if($("#iptv_checkbox").is(":checked")){
		goTo.loadPage("iptv_setting", true);
	}
	else if(systemVariable.detwanResult.wanType == "MODEM" || systemVariable.detwanResult.wanType == "DHCP"){
		if(qisPostData.hasOwnProperty("http_username"))
			goTo.loadPage("login_name", true);
		else
			goTo.loadPage("welcome", true);
	}
	else if(qisPostData.hasOwnProperty("wan_heartbeat_x")){
		goTo.loadPage("getIp_setting", true);
	}
	else if(qisPostData.hasOwnProperty("wan_pppoe_username")){
		goTo.loadPage("pppoe_setting", true);
	}
	else if(qisPostData.hasOwnProperty("wan_ipaddr_x")){
		goTo.loadPage("static_setting", true);
	}
	else{
		goTo.loadPage("wan_setting", true);
	}

};

abort.pppoe = function(){
	postDataModel.remove(wanObj.all);

	$("#vpnServerContainer").hide();

	if(location.search == "?flag=pppoe"){
		window.history.back();
	}
	else if(systemVariable.detwanResult.wanType == "PPPoE"){
		if(!systemVariable.forceChangePW)
			goTo.loadPage("welcome", true);
		else
			goTo.loadPage("login_name", true);
	}
	else{										
		goTo.loadPage("wan_setting", true);
	}
};

abort.getIp = function(){
	goTo.loadPage("pppoe_setting", true);
};

abort.static = function(){
	if(qisPostData.hasOwnProperty("wan_heartbeat_x")){
		postDataModel.remove(wanObj.staticIp);
		goTo.loadPage("getIp_setting", true);
	}
	else{
		postDataModel.remove(wanObj.all);
		goTo.loadPage("wan_setting", true);
	}
};

abort.iptv = function(){
	postDataModel.remove(iptvObj);

	if(qisPostData.hasOwnProperty("wan_heartbeat_x")){
		goTo.loadPage("getIp_setting", true);
	}
	else if(qisPostData.hasOwnProperty("wan_pppoe_username")){
		goTo.loadPage("pppoe_setting", true);
	}
	else if(qisPostData.hasOwnProperty("wan_ipaddr_x")){
		goTo.loadPage("static_setting", true);
	}
	else{
		goTo.loadPage("wan_setting", true);
	}
};

abort.getLanIp = function(){
	postDataModel.remove(lanObj.general);
	postDataModel.remove(lanObj.staticIp);

	if(location.search == "?flag=lanip"){
		window.history.back();
	}
	else if(qisPostData.hasOwnProperty("wlc_ssid")){
		if(qisPostData.wlc_auth_mode == "open" && qisPostData.wlc_wep == "0")
			goTo.loadPage("siteSurvey_page", true);
		else
			goTo.loadPage("wlcKey_setting", true);
	}
	else{
		if(isOriginSwMode("AP")){
			if(!systemVariable.forceChangePW)
				goTo.loadPage("welcome", true);
			else
				goTo.loadPage("login_name", true);	
		}
		else{
			goTo.loadPage("opMode_page", true);
		}
	}
};

abort.lanStatic = function(){
	postDataModel.remove(lanObj.staticIp);
	goTo.loadPage("getLanIp_setting", true);
};

abort.wlcKey = function(){
	goTo.loadPage("siteSurvey_page", true);
}

abort.siteSurvey = function(){
	postDataModel.remove(wlcObj);
	systemVariable.selectedAP = [];

	if(location.search == "?flag=sitesurvey_mb" || location.search == "?flag=sitesurvey_rep"){
		window.history.back();
	}
	else if(isOriginSwMode("RP") || isOriginSwMode("MB")){
		if(!systemVariable.forceChangePW)
			goTo.loadPage("welcome", true);
		else
			goTo.loadPage("login_name", true);	
	}
	else{
		goTo.loadPage("opMode_page", true);
	}
}

abort.wireless = function(){
	postDataModel.remove(generalObj);
	postDataModel.remove(wirelessObj.wl0);
	postDataModel.remove(wirelessObj.wl1);
	postDataModel.remove(wirelessObj.wl2);

	if($("#iptv_checkbox").is(":checked")){
		goTo.loadPage("iptv_setting", true);
	}
	else if(qisPostData.hasOwnProperty("modem_enable")){
		goTo.loadPage("modem_setting", true);
	}
	else if(qisPostData.hasOwnProperty("wan_heartbeat_x")){
		goTo.loadPage("getIp_setting", true);
	}
	else if(qisPostData.hasOwnProperty("wan_pppoe_username")){
		goTo.loadPage("pppoe_setting", true);
	}
	else if(qisPostData.hasOwnProperty("wan_ipaddr_x")){
		goTo.loadPage("static_setting", true);
	}
	else if(systemVariable.detwanResult.wanType == "DHCP"){
		if(!systemVariable.forceChangePW)
			goTo.loadPage("welcome", true);
		else
			goTo.loadPage("login_name", true);
	}
	else if(qisPostData.hasOwnProperty("lan_proto")){
		if(qisPostData.lan_proto === "dhcp")
			goTo.loadPage("getLanIp_setting", true);
		else
			goTo.loadPage("lanStatic_setting", true);
	}
	else{
		goTo.loadPage("wan_setting", true);
	}
};

abort.update = function(){
	httpApi.nvramSet({
		"action_mode": "apply",
		"rc_service": getRestartService()
	}, goTo.Finish);
};

abort.Pair = function(){
	$(".flashingColor").removeClass("blue");
	window.flashTimer = setInterval(function(){
		$(".flashingColor").toggleClass("green");
	}, 500);

	goTo.loadPage("wps_page", true);
};

abort.APP = function(){
	clearInterval(window.flashTimer);
	$(".flashingColor").removeClass("green");
	setTimeout(function(){
		$(".flashingColor").addClass("blue");
	}, 300);

	goTo.loadPage("pair_page", true);
};

abort.WPS = function(){
	clearInterval(window.flashTimer);
	setTimeout(function(){
		$(".flashingColor").removeClass("green").addClass("blue");
	}, 300);

	if(qisPostData.hasOwnProperty("sw_mode")){
		goTo.loadPage("opMode_page", true);
	}
	else if(!qisPostData.hasOwnProperty("action_mode")){
		if(!systemVariable.forceChangePW)
			goTo.loadPage("welcome", true);
		else
			goTo.loadPage("login_name", true);	
	}
	else{
		goTo.loadPage("summary_page", true);
	}
};


var goTo = {};

goTo.Welcome = function(){
	if(isOriginSwMode("RT")){
		setTimeout(function(){
			httpApi.hookGet("start_autodet"); /*  ToDo: Is it needed? */
		}, 500);

		setTimeout(function(){
			systemVariable.detwanResult = httpApi.detwanGetRet();
			if(systemVariable.detwanResult.wanType == "UNKNOWN" || systemVariable.detwanResult.wanType == ""){
				if(isPage("welcome") || isPage("login_name")) setTimeout(arguments.callee, 1000);
			}
		}, 1000);
	}

	if(systemVariable.isDefault){
		setUpTimeZone();
	}

	$("#tosCheckbox")
		.change(function(){
			$(this).val($(this).is(":checked"));

			if($("#tosCheckbox").is(":checked")){
				postDataModel.insert(bwdpiObj);
			}
			else{
				postDataModel.remove(bwdpiObj);
			}
		});

	$("#tosTitle")
		.click(function(){
			$("#tosCheckbox")
				.prop('checked', !$("#tosCheckbox").prop("checked"))
				.change()
		})

	$(".tosSupport")
		.toggle(systemVariable.isDefault && isSupport("QISBWDPI"));
};

goTo.Login = function(){
	postDataModel.insert(userObj);

	$("#http_username")
		.keyup(function(e){
			if(e.keyCode == 13){
				$("#http_passwd").focus();
			}
		});

	$("#http_passwd")
		.keyup(function(e){
			if(e.keyCode == 13){
				$("#http_passwd_confirm").focus();
			}
		});

	$("#http_passwd_confirm")
		.keyup(function(e){
			if(e.keyCode == 13){
				apply.login();
			}
		});

	goTo.loadPage("login_name", false);
};

goTo.autoWan = function(){
	systemVariable.opMode = "RT";
	postDataModel.remove(wanObj.all);

	if(systemVariable.manualWANSetup) return false;
	switch(systemVariable.detwanResult.wanType){
		case "DHCP":
			goTo.DHCP();
			break;
		case "PPPoE":
			goTo.PPPoE();
			break;
		case "Static":
			goTo.Static();
			break;
		case "NOWAN":
			goTo.NoWan();
			break;
		case "MODEM":
			goTo.Modem();
			break;
		case "UNKNOWN":
			goTo.Waiting();
			break;
		case "":
			goTo.Waiting();
			break;
		default:
			goTo.WAN();
			break;
	}
};

goTo.opMode = function(){
	postDataModel.insert(opModeObj);

	if(systemVariable.isDefault)
		goTo.loadPage("opMode_page", false);
	else
		goTo.WAN()
};

goTo.rtMode = function(){
	qisPostData.sw_mode = 1;
	qisPostData.wlc_psta = 0;
	systemVariable.opMode = "RT";

	goTo.WAN();
};

goTo.rpMode = function(){
	if(isSdk("7") || isSdk("9")){
		qisPostData.sw_mode = 3;
		qisPostData.wlc_psta = 2;
	}
	else{
		qisPostData.sw_mode = 2;
		qisPostData.wlc_psta = 0;
	}
	systemVariable.opMode = "RP";

	goTo.siteSurvey();
};

goTo.apMode = function(){
	qisPostData.sw_mode = 3;
	qisPostData.wlc_psta = 0;
	systemVariable.opMode = "AP";

	goTo.GetLanIp();
};

goTo.mbMode = function(){
	/*
		ToDo: Sysdep support
	*/

	qisPostData.sw_mode = 2;
	qisPostData.wlc_psta = 1;		
	systemVariable.opMode = "MB";

	goTo.siteSurvey();
};

goTo.meshMode = function(){
	systemVariable.opMode = "MESH";
	goTo.WPS();
};

goTo.WAN = function(){
	goTo.loadPage("wan_setting", false);
};

goTo.DHCP = function(){
	if(systemVariable.originWanType.toLowerCase() !== "dhcp"){
		postDataModel.remove(wanObj.all);

		postDataModel.insert(wanObj.general);
		postDataModel.insert(wanObj.dhcp);
		qisPostData.wan_proto = "dhcp";
	}

	apply.dhcp();
};

goTo.PPPoE = function(){
	if(systemVariable.originWanType.toLowerCase() !== "pppoe"){
		postDataModel.remove(wanObj.all);
		postDataModel.insert(wanObj.general);
		postDataModel.insert(wanObj.pppoe);
		qisPostData.wan_proto = "pppoe";
	}

	var pppoeInfo = httpApi.nvramGet(["wan0_pppoe_username", "wan0_pppoe_passwd"]);

	$("#wan_pppoe_username")
		.val(pppoeInfo.wan0_pppoe_username)
		.unbind("keyup")
		.keyup(function(e){
			if(e.keyCode == 13){
				$("#wan_pppoe_passwd").focus();
			}
		});

	$("#wan_pppoe_passwd")
		.val(pppoeInfo.wan0_pppoe_passwd)
		.unbind("keyup")
		.keyup(function(e){
			if(e.keyCode == 13){
				apply.pppoe();
			}
		});

	$(".pppInput")
		.unbind("change")
		.change(function(){
			postDataModel.insert(wanObj.general);
			postDataModel.insert(wanObj.pppoe);
			qisPostData.wan_proto = "pppoe";
		})

	goTo.loadPage("pppoe_setting", false);
};

goTo.Static = function(){
	if(systemVariable.originWanType.toLowerCase() !== "static"){
		postDataModel.remove(wanObj.all);
		postDataModel.insert(wanObj.staticIp);
		postDataModel.insert(wanObj.general);
		qisPostData.wan_proto = "static";
	}

	$("#static_ipaddr")
		.keyup(function(e){
			if(e.keyCode == 13){
				$("#static_subnet").focus();
			}
		});

	$("#static_subnet")
		.keyup(function(e){
			if(e.keyCode == 13){
				$("#static_gateway").focus();
			}
		});

	$("#static_gateway")
		.keyup(function(e){
			if(e.keyCode == 13){
				$("#static_dns1").focus();
			}
		});

	$("#static_dns1")
		.keyup(function(e){
			if(e.keyCode == 13){
				$("#static_dns2").focus();
			}
		});

	$("#static_dns2")
		.keyup(function(e){
			if(e.keyCode == 13){
				apply.static();
			}
		});

	$(".staticInput")
		.change(function(){
			postDataModel.insert(wanObj.staticIp);
			postDataModel.insert(wanObj.general);
			qisPostData.wan_proto = "static";
		})

	goTo.loadPage("static_setting", false);		
};

goTo.PPTP = function(){
	postDataModel.insert(wanObj.general);
	qisPostData.wan_proto = "pptp";
	goTo.VPN();
};

goTo.L2TP = function(){
	postDataModel.insert(wanObj.general);
	qisPostData.wan_proto = "l2tp";
	goTo.VPN();
};

goTo.VPN = function(){
	$("#vpnServerContainer").show();

	var pppoeInfo = httpApi.nvramGet(["wan0_pppoe_username", "wan0_pppoe_passwd", "wan0_heartbeat_x"]);

	$("#wan_pppoe_username")
		.val(pppoeInfo.wan0_pppoe_username)
		.unbind("keyup")
		.keyup(function(e){
			if(e.keyCode == 13){
				$("#wan_pppoe_passwd").focus();
			}
		});

	$("#wan_pppoe_passwd")
		.val(pppoeInfo.wan0_pppoe_passwd)
		.unbind("keyup")
		.keyup(function(e){
			if(e.keyCode == 13){
				$("#wan_heartbeat_x").focus();
			}
		});

	$("#wan_heartbeat_x")
		.val(pppoeInfo.wan0_heartbeat_x)
		.unbind("keyup")
		.keyup(function(e){
			if(e.keyCode == 13){
				apply.pppoe();
			}
		});

	$(".pppInput")
		.unbind("change")
		.change(function(){
			postDataModel.insert(wanObj.pppoe);
			postDataModel.insert(wanObj.vpn);
		})

	goTo.loadPage("pppoe_setting", false);
};

goTo.GetIp = function(){
	goTo.loadPage("getIp_setting", false);
};

goTo.vpnDHCP = function(){
	postDataModel.insert(wanObj.dhcp);
	apply.dhcp();
};

goTo.vpnStatic = function(){
	$("#static_ipaddr")
		.keyup(function(e){
			if(e.keyCode == 13){
				$("#static_subnet").focus();
			}
		});

	$("#static_subnet")
		.keyup(function(e){
			if(e.keyCode == 13){
				$("#static_gateway").focus();
			}
		});

	$("#static_gateway")
		.keyup(function(e){
			if(e.keyCode == 13){
				$("#static_dns1").focus();
			}
		});

	$("#static_dns1")
		.keyup(function(e){
			if(e.keyCode == 13){
				$("#static_dns2").focus();
			}
		});

	$("#static_dns2")
		.keyup(function(e){
			if(e.keyCode == 13){
				apply.static();
			}
		});

	$(".staticInput")
		.change(function(){
			postDataModel.insert(wanObj.staticIp);
		})

	goTo.loadPage("static_setting", false);		
};

goTo.IPTV = function(){
	postDataModel.insert(iptvObj);

	$("#iptv_auth_mode")
		.change(function(){$(".iptv_pppoe_setting").toggle($("#iptv_auth_mode").val() == "8021x-md5")})
		.trigger("change")

	$("#switch_wantag")
		.change(function(){
			var isp = $("#switch_wantag").val();
			switch(isp){
				case "none":
					qisPostData.switch_wantag = "none";
					qisPostData.switch_stb_x = "0";
					qisPostData.switch_wan0tagid = "";
					qisPostData.switch_wan0prio = "0";
					qisPostData.switch_wan1tagid = "";
					qisPostData.switch_wan1prio = "0";
					qisPostData.switch_wan2tagid = "";
					qisPostData.switch_wan2prio = "0";

					$("#iptv_stb").hide();
					$("#iptv_voip").hide();
					$("#iptv_manual").hide();
					$("#iptv_wanSetup").hide();
					break;
				case "unifi_home":
					qisPostData.switch_wantag = "unifi_home";
					qisPostData.switch_stb_x = "4";
					qisPostData.switch_wan0tagid = "500";
					qisPostData.switch_wan0prio = "0";
					qisPostData.switch_wan1tagid = "600";
					qisPostData.switch_wan1prio = "0";
					qisPostData.switch_wan2tagid = "0";
					qisPostData.switch_wan2prio = "0";

					$("#iptv_stb").show();
					$("#iptv_voip").hide();
					$("#iptv_manual").hide();
					$("#iptv_wanSetup").hide();
					break;
				case "unifi_biz":
					qisPostData.switch_wantag = "unifi_biz";
					qisPostData.switch_stb_x = "0";
					qisPostData.switch_wan0tagid = "500";
					qisPostData.switch_wan0prio = "0";
					qisPostData.switch_wan1tagid = "0";
					qisPostData.switch_wan1prio = "0";
					qisPostData.switch_wan2tagid = "0";
					qisPostData.switch_wan2prio = "0";

					$("#iptv_stb").hide();
					$("#iptv_voip").hide();
					$("#iptv_manual").hide();
					$("#iptv_wanSetup").hide();
					break;
				case "singtel_mio":
					qisPostData.switch_wantag = "singtel_mio";
					qisPostData.switch_stb_x = "6";
					qisPostData.switch_wan0tagid = "10";
					qisPostData.switch_wan0prio = "0";
					qisPostData.switch_wan1tagid = "20";
					qisPostData.switch_wan1prio = "4";
					qisPostData.switch_wan2tagid = "30";
					qisPostData.switch_wan2prio = "4";

					$("#iptv_stb").show();
					$("#iptv_voip").show();
					$("#iptv_manual").hide();
					$("#iptv_wanSetup").hide();
					break;
				case "singtel_others":
					qisPostData.switch_wantag = "singtel_others";
					qisPostData.switch_stb_x = "4";
					qisPostData.switch_wan0tagid = "10";
					qisPostData.switch_wan0prio = "0";
					qisPostData.switch_wan1tagid = "20";
					qisPostData.switch_wan1prio = "4";
					qisPostData.switch_wan2tagid = "0";
					qisPostData.switch_wan2prio = "0";

					$("#iptv_stb").show();
					$("#iptv_voip").hide();
					$("#iptv_manual").hide();
					$("#iptv_wanSetup").hide();
					break;
				case "m1_fiber":
					qisPostData.switch_wantag = "m1_fiber";
					qisPostData.switch_stb_x = "3";
					qisPostData.switch_wan0tagid = "1103";
					qisPostData.switch_wan0prio = "1";
					qisPostData.switch_wan1tagid = "0";
					qisPostData.switch_wan1prio = "0";
					qisPostData.switch_wan2tagid = "1107";
					qisPostData.switch_wan2prio = "1";

					$("#iptv_stb").hide();
					$("#iptv_voip").show();
					$("#iptv_manual").hide();
					$("#iptv_wanSetup").hide();
					break;
				case "maxis_fiber":
					qisPostData.switch_wantag = "maxis_fiber";
					qisPostData.switch_stb_x = "3";
					qisPostData.switch_wan0tagid = "621";
					qisPostData.switch_wan0prio = "0";
					qisPostData.switch_wan1tagid = "0";
					qisPostData.switch_wan1prio = "0";
					qisPostData.switch_wan2tagid = "821";
					qisPostData.switch_wan2prio = "0";

					$("#iptv_stb").hide();
					$("#iptv_voip").show();
					$("#iptv_manual").hide();
					$("#iptv_wanSetup").hide();
					break;
				case "maxis_fiber_sp":
					qisPostData.switch_wantag = "maxis_fiber_sp";
					qisPostData.switch_stb_x = "3";
					qisPostData.switch_wan0tagid = "11";
					qisPostData.switch_wan0prio = "0";
					qisPostData.switch_wan1tagid = "0";
					qisPostData.switch_wan1prio = "0";
					qisPostData.switch_wan2tagid = "14";
					qisPostData.switch_wan2prio = "0";

					$("#iptv_stb").hide();
					$("#iptv_voip").show();
					$("#iptv_manual").hide();
					$("#iptv_wanSetup").hide();
					break;
				case "movistar":
					qisPostData.switch_wantag = "movistar";
					qisPostData.switch_stb_x = "8";
					qisPostData.switch_wan0tagid = "6";
					qisPostData.switch_wan0prio = "0";
					qisPostData.switch_wan1tagid = "2";
					qisPostData.switch_wan1prio = "0";
					qisPostData.switch_wan2tagid = "3";
					qisPostData.switch_wan2prio = "0";
					qisPostData.wan10_proto = "static";
					qisPostData.wan11_proto = "dhcp";

					$("#iptv_stb").hide();
					$("#iptv_voip").hide();
					$("#iptv_manual").hide();
					$("#iptv_wanSetup").show();
					break;
				case "meo":
					qisPostData.switch_wantag = "meo";
					qisPostData.switch_stb_x = "4";
					qisPostData.switch_wan0tagid = "12";
					qisPostData.switch_wan0prio = "0";
					qisPostData.switch_wan1tagid = "12";
					qisPostData.switch_wan1prio = "0";
					qisPostData.switch_wan2tagid = "";
					qisPostData.switch_wan2prio = "0";

					$("#iptv_stb").show();
					$("#iptv_voip").hide();
					$("#iptv_manual").hide();
					$("#iptv_wanSetup").hide();
					break;
				case "vodafone":
					qisPostData.switch_wantag = "vodafone";
					qisPostData.switch_stb_x = "3";
					qisPostData.switch_wan0tagid = "100";
					qisPostData.switch_wan0prio = "1";
					qisPostData.switch_wan1tagid = "";
					qisPostData.switch_wan1prio = "0";
					qisPostData.switch_wan2tagid = "105";
					qisPostData.switch_wan2prio = "1";

					$("#iptv_stb").show();
					$("#iptv_voip").show();
					$("#iptv_manual").hide();
					$("#iptv_wanSetup").hide();
					break;
				case "hinet":
					qisPostData.switch_wantag = "hinet";
					qisPostData.switch_stb_x = "4";
					qisPostData.switch_wan0tagid = "";
					qisPostData.switch_wan0prio = "0";
					qisPostData.switch_wan1tagid = "";
					qisPostData.switch_wan1prio = "0";
					qisPostData.switch_wan2tagid = "";
					qisPostData.switch_wan2prio = "0";

					$("#iptv_stb").show();
					$("#iptv_voip").hide();
					$("#iptv_manual").hide();
					$("#iptv_wanSetup").hide();
					break;
				case "stuff_fibre":
					qisPostData.switch_wantag = "stuff_fibre";
					qisPostData.switch_stb_x = "0";
					qisPostData.switch_wan0tagid = "10";
					qisPostData.switch_wan0prio = "0";
					qisPostData.switch_wan1tagid = "0";
					qisPostData.switch_wan1prio = "0";
					qisPostData.switch_wan2tagid = "0";
					qisPostData.switch_wan2prio = "0";

					$("#iptv_stb").hide();
					$("#iptv_voip").hide();
					$("#iptv_manual").hide();
					$("#iptv_wanSetup").hide();
					break;
				case "manual":
					qisPostData.switch_wantag = "manual";

					$("#iptv_stb").show();
					$("#iptv_voip").show();
					$("#iptv_manual").show();
					$("#iptv_wanSetup").hide();
					break;
			}

			$("#iptv_voip_title").html(function(){
				return (isp == "vodafone") ? "IPTV STB Port" : "VoIP Port";
			});

			$("#iptv_stb_title").html(function(){
				return (isp == "vodafone" || isp == "meo") ? "Bridge Port" : "IPTV STB Port";
			});
		})
		.trigger("change")

	$("#iptv_checkbox")
		.change(function(){
			if($("#iptv_checkbox").is(":checked")){
				postDataModel.insert(iptvObj);
			}
			else{
				postDataModel.remove(iptvObj);
			}
		})

	goTo.loadPage("iptv_setting", false);
};

goTo.GetLanIp = function(){
	postDataModel.insert(lanObj.general);
	goTo.loadPage("getLanIp_setting", false);
};

goTo.lanDHCP = function(){
	qisPostData.lan_proto = "dhcp";
	qisPostData.lan_dnsenable_x = "1";

	if(isSwMode("MB")){
		httpApi.nvramSet((function(){
			qisPostData.action_mode = "apply";
			qisPostData.rc_service = getRestartService();
			return qisPostData;
		})(), goTo.Finish);
	}
	else{
		goTo.Wireless();
	}
};

goTo.lanStatic = function(){
	$("#static_lan_ipaddr")
		.keyup(function(e){
			if(e.keyCode == 13){
				$("#static_lan_subnet").focus();
			}
		});

	$("#static_lan_subnet")
		.keyup(function(e){
			if(e.keyCode == 13){
				$("#static_lan_gateway").focus();
			}
		});

	$("#static_lan_gateway")
		.keyup(function(e){
			if(e.keyCode == 13){
				$("#static_lan_dns1").focus();
			}
		});

	$("#static_lan_dns1")
		.keyup(function(e){
			if(e.keyCode == 13){
				$("#static_lan_dns2").focus();
			}
		});

	$("#static_lan_dns2")
		.keyup(function(e){
			if(e.keyCode == 13){
				apply.static();
			}
		});

	postDataModel.insert(lanObj.staticIp);
	goTo.loadPage("lanStatic_setting", false);		
};

goTo.siteSurvey = function(){
	httpApi.nvramSet({"action_mode": "apply", "rc_service":"restart_wlcscan"}, function(){
		$("#apList").html(Get_Component_Loading);

		setTimeout(function(){
			var siteSurveyResult = {
				"isFinish": false,
				"aplist": []
			};

			var profile = function(_profile){
				var getBandWidthName = function(ch){
					if(ch >= 1 && ch <= 14){
						return {name: "2.4GHz", unit: 0};
					}
					else{
						if(isSupport("TRIBAND"))
							return (ch >= 36 && ch <= 64) ? {name: "5GHz-1", unit: 1} : {name: "5GHz-2", unit: 2};
						else
							return {name: "5GHz", unit: 1};		
					}
				}

				if(_profile == null || _profile.length == 0)
					_profile = ["", "", "", "", "", "", "", "", ""];

				this.band = getBandWidthName(_profile[2]).name;
				this.unit = getBandWidthName(_profile[2]).unit;
				this.ssid = htmlEnDeCode.htmlEncode(decodeURIComponent(_profile[1]));
				this.channel = _profile[2];
				this.authentication = _profile[3];
				this.encryption = _profile[4];
				this.signal = (Math.ceil(_profile[5]/25) == 0) ? 1 : Math.ceil(_profile[5]/25);
				this.macaddr = _profile[6];
				this.wlmode = _profile[7];
				this.state = _profile[8];
				this.thekey = "";
				this.thekeyindex = "";
				this.thekeyauthmode = "";
			}

			siteSurveyResult.aplist = httpApi.hookGet("get_ap_info", true).get_ap_info;
			siteSurveyResult.isFinish = (httpApi.nvramGet(["wlc_scan_state"], true).wlc_scan_state == "3");

			for(var i=0; i<siteSurveyResult.aplist.length; i++){
				var site = new profile(siteSurveyResult.aplist[i]);
				if(systemVariable.papList.indexOf(site.macaddr) === -1){
					systemVariable.papList.push(site.macaddr);
					systemVariable.papList[site.macaddr] = site;
				}
			}

			if(systemVariable.papList.length > 0){
				$("#apList").html(function(){
					var tmpHtml = "";
					systemVariable.papList.forEach(function(macIndex){
						var AP = systemVariable.papList[macIndex];
						if(AP.ssid == "") return true;
						tmpHtml += '<div id="'
						tmpHtml += AP.macaddr;
						tmpHtml += '" class="apListContainer apProfile">';
						tmpHtml += '<div class="apListDiv">';
						tmpHtml += '<div class="ap_icon_container">';
						tmpHtml += '<div class="icon_wifi_';
						tmpHtml += AP.signal;
						tmpHtml += AP.encryption == "NONE" ? "" : "_lock";
						tmpHtml += ' ap_icon"></div></div>';
						tmpHtml += '<div class="ap_ssid">';
						tmpHtml += AP.ssid;
						tmpHtml += '</div><div class="ap_band">';
						tmpHtml += AP.band;
						tmpHtml += '</div><div class="ap_narrow_container">';
						tmpHtml += '<div class="icon_arrow_right ap_narrow"></div>';
						tmpHtml += '</div></div></div>';
					})
					return tmpHtml;
				})

				$(".apProfile").click(function(){
					systemVariable.selectedAP = systemVariable.papList[this.id];
					postDataModel.insert(wlcObj);

					qisPostData.wlc_ssid = htmlEnDeCode.htmlDecode(systemVariable.selectedAP.ssid)
					qisPostData.wlc_band = systemVariable.selectedAP.unit

					if(systemVariable.selectedAP.encryption == "NONE"){				
						qisPostData.wlc_auth_mode = "open";
						qisPostData.wlc_crypto = "";
						qisPostData.wlc_wep = "0";

						goTo.GetLanIp();
					}
					else{
						if(systemVariable.selectedAP.encryption == "WEP"){
							qisPostData.wlc_auth_mode = "open"; // open/shared authentication use the same profile, UI don't know which one to use.
							qisPostData.wlc_crypto = "";
						}
						else if(systemVariable.selectedAP.encryption == "TKIP"){
							qisPostData.wlc_auth_mode = "psk";
							qisPostData.wlc_crypto = "tkip";			
							qisPostData.wlc_wep = "0";
						}
						else if(systemVariable.selectedAP.encryption == "AES" && systemVariable.selectedAP.authentication == "WPA-Personal"){
							qisPostData.wlc_auth_mode = "psk";
							qisPostData.wlc_crypto = "aes";
							qisPostData.wlc_wep = "0";
						}			
						else{
							qisPostData.wlc_auth_mode = "psk2";
							qisPostData.wlc_crypto = "aes";
							qisPostData.wlc_wep = "0";
						}

						goTo.wlcKey();
					}
				});
			}

			if(!siteSurveyResult.isFinish && isPage("siteSurvey_page")) setTimeout(arguments.callee, 1000);
		}, 1000);
	});
	
	goTo.loadPage("siteSurvey_page", false);
};

goTo.wlcKey = function(){
	goTo.loadPage("wlcKey_setting", false);
};

goTo.Wireless = function(){
	function genWirelessInputField(__wlArray){
		$("#wlInputField")
			.hide()
			.html(Get_Component_WirelessInput(__wlArray))
			.fadeIn()

		$(".wlInput")
			.change(function(e){
				postDataModel.insert(wirelessObj.wl0);
				if(isSupport("DUALBAND")) postDataModel.insert(wirelessObj.wl1);
				if(isSupport("TRIBAND")) postDataModel.insert(wirelessObj.wl2);
			});

		$(".secureInput")
			.click(checkPasswd);
	}

	postDataModel.insert(generalObj);

	if(!$(".wlInput").length){
		genWirelessInputField([{"title":"", "ifname":"0"}])

		$("#wireless_checkbox").change(function(e){
			$(this).val($(this).is(':checked'));

			if($(this).is(':checked')){
				var wlArray = [{"title":"2.4GHz", "ifname":"0"}];
				
				if(isSupport("TRIBAND")){
					wlArray.push({"title":"5GHz-1", "ifname":"1"})
					wlArray.push({"title":"5GHz-2", "ifname":"2"})
				}
				else if(isSupport("DUALBAND")){
					wlArray.push({"title":"5GHz", "ifname":"1"})
				}
			}
			else{
				var wlArray = [{"title":"", "ifname":"0"}];
			}

			genWirelessInputField(wlArray);
		})
	}

	if(isSwModeChanged()){
		postDataModel.insert(wirelessObj.wl0);
		postDataModel.insert(wirelessObj.wl1);

		if(isSupport("TRIBAND")) postDataModel.insert(wirelessObj.wl2);
	}

	if(!systemVariable.newFwVersion){
		setTimeout(function(){
			httpApi.nvramSet({"action_mode":"apply", "rc_service":"start_webs_update"}, function(){
				setTimeout(function(){
					var fwInfo = httpApi.nvramGet(["webs_state_update", "webs_state_info", "cfg_check"], true);

					if(fwInfo.webs_state_update == "0" || fwInfo.webs_state_update == ""){
						setTimeout(arguments.callee, 1000);
					}
					else if(fwInfo.webs_state_info !== ""){
						systemVariable.isNewFw = isNewFw(fwInfo.webs_state_info);
						systemVariable.newFwVersion = fwInfo.webs_state_info;
					}
				}, 500);
			});
		}, 500);
	}

	goTo.loadPage("wireless_setting", false);
};

goTo.Modem = function(){
	postDataModel.insert(modemObj);

	require(['/require/modules/modem.js'], function(modem) {
		$.each(modem.profile, function(country, ispProfile){
			$("#modem_country").append($('<option>', {
				"value": country,
				"text": ispProfile.countryName
			}))
		});

		$("#modem_android")
			.change(function(){
				$(".dongle").toggle($(this).val() == "0");
				$("#modem_autoapn").trigger("change")
			});

		$("#modem_autoapn")
			.change(function(){
				$(".modem_manual").toggle($("#modem_autoapn").val() != "0")
			});

		$("#modem_country")
			.change(function(){
				var country = $(this).val();
				$("#modem_isp").html("");
				$.each(modem.profile[country].config, function(idx, ispConfig){
					$("#modem_isp").append($('<option>', {
						"value": ispConfig.isp,
						"text": ispConfig.isp
					}));		
				});

				$("#modem_isp_container").toggle($($("#modem_isp").html()).val() !== "");
				$("#modem_enable_container").toggle($($("#modem_isp").html()).val() === "");
				$("#modem_isp").trigger("change");
			})
			.trigger("change");

		$("#modem_isp")
			.change(function(){
				var config = modem.profile[$("#modem_country").val()].config[$("#modem_isp").prop('selectedIndex')]
				$("#modem_apn").val(config.apn.split(";")[0]);
				$("#modem_dialnum").val(config.dialnum);
				$("#modem_user").val(config.user);
				$("#modem_pass").val(config.pass);
				$("#modem_enable").val(config.proto).trigger("change");
			})
			.trigger("change");

		$("#modem_enable")
			.change(function(){
				$("#Dev3G").html("");
				var isWiMax = ($(this).val() === "4");
				var dongleList = (isWiMax) ? modem.wimaxDongle : modem.hsdpaDongle;
				$.each(dongleList, function(index, dongle){
					$("#Dev3G").append($('<option>', {
						"value": dongle,
						"text": dongle
					}))
				});

				$("#modem_apn_container").toggle(!isWiMax);
				$("#modem_dialnum_container").toggle(!isWiMax);					
				$("#modem_ttlsid_container").toggle(isWiMax);					
				$("#Dev3G").trigger("change")
			})
			.trigger("change");

		$("#Dev3G")
			.toggle(!isSupport("gobi"));
	});

	goTo.loadPage("modem_setting", false);		
};

goTo.Update = function(){
	$("#newVersion").val(systemVariable.newFwVersion);
	goTo.loadPage("update_page", false);
};

goTo.Upgrading = function(){
	setTimeout(function(){
		var	fwUpgradeInfo = httpApi.nvramGet(["webs_state_upgrade", "webs_state_error"], true);

		if(fwUpgradeInfo.isError){
			$("#upgradeBtn").show();
			$(".detectIcon").hide();
			$("#liveUpdateStatus").html("<#Congratulations#><br/><#is_latest#>");
		}
		else if(fwUpgradeInfo.webs_state_upgrade == "0"){
			$("#liveUpdateStatus").html("<#fw_downloading#>...");
			setTimeout(arguments.callee, 1000);
		}
		else if(fwUpgradeInfo.webs_state_error != "0" && fwUpgradeInfo.webs_state_error != ""){
			$("#upgradeBtn").show();
			$(".detectIcon").hide();
			$("#liveUpdateStatus").html("<#FIRM_fail_desc#>");
		}
		else{
			$("#liveUpdateStatus").html("<#FIRM_ok_desc#>");
			setTimeout(arguments.callee, 1000);
		}
	}, 500);

	goTo.loadPage("upgrading_page", false);
};

goTo.Finish = function(){
	if(!isSwMode("MB")){
		$("#wirelessFinishFiled").append($("#wlInputField"));
		$(".secureInput").hide();
		$(".wlInput").attr({
			"disabled": "true",
			"type": "text"
		});
	}

	if(isSupport("LYRA")){
		clearInterval(window.flashTimer);
		setTimeout(function(){
			$(".flashingColor").removeClass("green").addClass("blue")
		}, 300);
	}

	goTo.loadPage("summary_page", false);
};

goTo.APP = function(){
	goTo.loadPage("app_page", false)
};

goTo.WPS = function(){
	$(".flashingColor").removeClass("blue");
	window.flashTimer = setInterval(function(){
		$(".flashingColor").toggleClass("green");
	}, 500);

	goTo.loadPage("wps_page", false)
};

goTo.Pair = function(){
	clearInterval(window.flashTimer);
	setTimeout(function(){
		$(".flashingColor").removeClass("green").addClass("blue")
	}, 300);

	goTo.loadPage("pair_page", false)
};

goTo.NoWan = function(){
	if(isSupport("modem")){
		setTimeout(function(){
			$(".noWanEth")
				.hide()
				.toggleClass("noWanUsb")
				.fadeIn();

			if(isPage("noWan_page")) setTimeout(arguments.callee, 1000);
		}, 1000)
	}

	setTimeout(function(){
		systemVariable.detwanResult = httpApi.detwanGetRet();
		switch(systemVariable.detwanResult.wanType){
			case "DHCP":
				goTo.DHCP();
				break;
			case "PPPoE":
				goTo.PPPoE();
				break;
			case "Static":
				goTo.Static();
				break;
			default:
				if(isPage("noWan_page")) setTimeout(arguments.callee, 1000);
				break;
		}
	}, 500);

	goTo.loadPage("noWan_page", false);	
};

goTo.Waiting = function(){
	setTimeout(function(){
		if(systemVariable.detwanResult.wanType == "" || systemVariable.detwanResult.wanType == "UNKNOWN"){
			systemVariable.detwanResult = httpApi.detwanGetRet();
			if(isPage("waiting_page")) setTimeout(arguments.callee, 1000);
			return false;
		}

		goTo.autoWan();
	}, 1000);

	goTo.loadPage("waiting_page", false);	
};

goTo.AsusPP = function(){
	goTo.loadPage("asuspp_page", false);
};

goTo.AsusToS = function(){
	goTo.loadPage("asustos_page", false);
};

goTo.TMToS = function(){
	goTo.loadPage("tmtos_page", false);
};

goTo.loadPage = function(page, _reverse){
	var $obj = $("#"+page);
	if($obj.find($(".pageDesc")).length === 0) $obj.load("/mobile/pages/" + page + ".html");
	$.mobile.changePage("#"+page, {transition: "slide", changeHash: false, reverse: _reverse});
};
