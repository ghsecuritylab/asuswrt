function wl_chanspec_list_change(){
	var phytype = "n";
	var band = document.form.wl_unit.value;
	var bw_cap = document.form.wl_bw.value;
	var bw_cap_ori = '<% nvram_get("wl_bw"); %>';
	var chanspecs = new Array(0);
	var chanspecs_string = new Array(0);
	var cur = 0;
	var sel = 0;
	var cur_control_channel = 0;
	var extend_channel = new Array();
	var cur_extend_channel = 0;			//current extension channel
	var channel_ori = '<% nvram_get("wl_chanspec"); %>';
	
	if(country == ""){
		country = prompt("The Country Code is not exist! Please enter Country Code.", "");
	}

	/* Save current chanspec */
	cur = '<% nvram_get("wl_chanspec"); %>';
	if (phytype == "a") {	// a mode
		chanspecs = new Array(0); 
	}
	else if (phytype == "n"){ // n mode
		if (band == "1"){ // ---- 5 GHz
			if(wl_channel_list_5g instanceof Array && wl_channel_list_5g != ["0"]){	//With wireless channel 5g hook or return not ["0"]
				if(based_modelid == "RT-AC87U"){
					if(document.form.wl_bw.value==1){
						wl_channel_list_5g = JSON.parse('<% channel_list_5g_20m(); %>');
					}else if(document.form.wl_bw.value==2){
						wl_channel_list_5g = JSON.parse('<% channel_list_5g_40m(); %>');
					}else if(document.form.wl_bw.value==3){
						wl_channel_list_5g = JSON.parse('<% channel_list_5g_80m(); %>');
					}else{		//exception, RT-AC87U without 'auto'
						wl_channel_list_5g = JSON.parse('<% channel_list_5g(); %>');
					}
				}else{
					wl_channel_list_5g = JSON.parse('<% channel_list_5g(); %>');
				}	

				extend_channel = ["<#Auto#>"];		 // for 5GHz, extension channel always displays Auto
				extend_channel_value = [""];
				if(country != "JP"){		// remove Weather Radar Channel
					if(wl_channel_list_5g.getIndexByValue("120") != -1){
						wl_channel_list_5g.splice(wl_channel_list_5g.getIndexByValue("120"),1);
					}
					
					if(wl_channel_list_5g.getIndexByValue("124") != -1){
						wl_channel_list_5g.splice(wl_channel_list_5g.getIndexByValue("124"),1);
					}
					
					if(wl_channel_list_5g.getIndexByValue("128") != -1){
						wl_channel_list_5g.splice(wl_channel_list_5g.getIndexByValue("128"),1);
					}
				}
						
				if(bw_cap == "0"){	// 20/40/80 MHz (auto)
					document.getElementById('wl_nctrlsb_field').style.display = "";
					for(i=0; i<wl_channel_list_5g.length; i++){
						var _cur_channel = parseInt(wl_channel_list_5g[i]);
						if(_cur_channel == 165 || _cur_channel == 140){		//140, 165 belong to 20 MHz
							wl_channel_list_5g[i] = _cur_channel;
						}
						else if(_cur_channel == 132 || _cur_channel == 136){		// belong to 40MHz
							wl_channel_list_5g[i] = wlextchannel_fourty(_cur_channel);													
						}					
						else if(country == "TW" && (_cur_channel == 56)){		//56 belong 20 MHz only for TW
							wl_channel_list_5g[i] =_cur_channel;
						}
						else if(country != "JP" && _cur_channel == 116){		//116 belong 20 MHz, except JP
							wl_channel_list_5g[i] = _cur_channel;
						}
						else if(country == "TW" && (_cur_channel == 60 || _cur_channel == 64)){	// belong to 40 MHz, can not combine into 80 MHz due to without channel 52 
							wl_channel_list_5g[i] = wlextchannel_fourty(_cur_channel);
						}					
						else if(document.form.wl_nmode_x.value == 1){		// N only
							wl_channel_list_5g[i] = wlextchannel_fourty(_cur_channel);
						}
						else{
							if(band5g_11ac_support){
								wl_channel_list_5g[i] = _cur_channel + "/80";
							}
							else{		// 11n model, RT-N66U
								wl_channel_list_5g[i] = wlextchannel_fourty(_cur_channel);	
							}
						}						
					}									
				}
				else if(bw_cap == "3"){	// 80 MHz
					document.getElementById('wl_nctrlsb_field').style.display = "";
					for(i=wl_channel_list_5g.length-1; i>=0; i--){
						var _cur_channel = parseInt(wl_channel_list_5g[i]);
						if(_cur_channel == 165){		//remove 165, only belong to 20 MHz
							wl_channel_list_5g.splice(wl_channel_list_5g.getIndexByValue(_cur_channel),1);
						}
						else if(_cur_channel >= 132 && _cur_channel <= 140 ){		// remove invalid channel under 80 MHz
							wl_channel_list_5g.splice(wl_channel_list_5g.getIndexByValue(_cur_channel),1);
						}							
						else if(country != "JP" && _cur_channel == 116){	// remove invalid channel under 80 MHz, due to without Weather Radio Channel
							wl_channel_list_5g.splice(wl_channel_list_5g.getIndexByValue(_cur_channel),1);
						}	
						else if(country == "TW" && _cur_channel >= 56 && _cur_channel <= 64){		// remove invalid channel under 80 MHz, due to without channel 52													
							wl_channel_list_5g.splice(wl_channel_list_5g.getIndexByValue(_cur_channel),1);
						}
						else{
							wl_channel_list_5g[i] =_cur_channel + "/80";
						}		
					}										
				}
				else if(bw_cap == "2"){		// 40MHz
					document.getElementById('wl_nctrlsb_field').style.display = "";
					for(i=wl_channel_list_5g.length-1; i>=0; i--){
						var _cur_channel = parseInt(wl_channel_list_5g[i]);
						if(_cur_channel == 165 || _cur_channel == 140){		//remove 140, 165, only belong to 20MHz
							wl_channel_list_5g.splice(wl_channel_list_5g.getIndexByValue(_cur_channel),1);
						}
						else if(country != "JP" && _cur_channel == 116){			// remove 116, only under 20 MHz except JP 
							wl_channel_list_5g.splice(wl_channel_list_5g.getIndexByValue(_cur_channel),1);
						}
						else if(country == "TW" && _cur_channel == 56){			//remove channel 56, due to without channel 52
							wl_channel_list_5g.splice(wl_channel_list_5g.getIndexByValue(_cur_channel),1);
						}
						else{
							wl_channel_list_5g[i] = wlextchannel_fourty(_cur_channel);	
						}	
					}	
				}
				else{		//20MHz
					document.getElementById('wl_nctrlsb_field').style.display = "none";
				}

				if(based_modelid == "RT-AC87U" && country == "EU"){		//for 5GHz DFS channel of RT-AC87U
					if(bw_cap == "1"){		// 20 MHz
						for(i=wl_channel_list_5g.length-1; i>=0; i--){		// remove channel between 52 ~ 140 DFS channel of RT-AC87U for EU, only under 20 MHz
							var _cur_channel = parseInt(wl_channel_list_5g[i]);
							if(_cur_channel >= 52 && _cur_channel <= 140){
								wl_channel_list_5g.splice(wl_channel_list_5g.getIndexByValue(_cur_channel),1);
							}
						}

						document.getElementById('dfs_checkbox').style.display = "none";
						document.form.acs_dfs.disabled = true;
					}
					else{
						if(bw_cap != bw_cap_ori){		//40 <-> 80 MHz switch each other
							document.getElementById('dfs_checkbox').style.display = "";
							document.form.acs_dfs.disabled = false;
						}
						else{		//switch back to origin bandwidth
							if(channel_ori == "0"){		//check control channel is auto to decide to show DFS checkbox
								document.getElementById('dfs_checkbox').style.display = "";
								document.form.acs_dfs.disabled = false;
							}
							else{
								document.getElementById('dfs_checkbox').style.display = "none";
								document.form.acs_dfs.disabled = true;
							}
						}			
					}			
				}
						
				/*add "Auto" into the option list*/		
				if(wl_channel_list_5g[0] != "0")	
					wl_channel_list_5g.splice(0,0,"0");
			
				add_options_x2(document.form.wl_nctrlsb, extend_channel, extend_channel_value, 1);   //construct extension channel
				chanspecs = wl_channel_list_5g;						
			}
		}
		else if (band == "0"){ // - 2.4 GHz				
			if(wl_channel_list_2g instanceof Array && wl_channel_list_2g != ["0"]){		//with wireless channel 2.4g hook or return ["0"]
				wl_channel_list_2g = JSON.parse('<% channel_list_2g(); %>');
				if(wl_channel_list_2g[0] != "0"){
					wl_channel_list_2g.splice(0,0,"0");
				}				
					
				if(cur.search('[ul]') != -1){
					cur_extend_channel = cur.slice(-1);			//current control channel
					cur_control_channel = cur.split(cur_extend_channel)[0];	//current extension channel direction
				}
				else{
					cur_control_channel = cur;
				}				
						
				if(bw_cap == "2" || bw_cap == "0") { 	// -- [40 MHz]  | [20/40 MHz]				
					document.getElementById('wl_nctrlsb_field').style.display = "";
					if(cur_control_channel == 0){
						extend_channel = ["<#Auto#>"];
						extend_channel_value = ["1"];
						add_options_x2(document.form.wl_nctrlsb, extend_channel, extend_channel_value, 1);	
					}
					else if(cur_control_channel >= 1 && cur_control_channel <= 4){
						extend_channel = ["<#WLANConfig11b_EChannelAbove#>"];
						add_options_x2(document.form.wl_nctrlsb, extend_channel, "l");							
					}
					else if(wl_channel_list_2g.length == 12){    // 1 ~ 11
						if(cur_control_channel >= 5 && cur_control_channel <= 7){
							extend_channel = ["<#WLANConfig11b_EChannelAbove#>", "<#WLANConfig11b_EChannelBelow#>"];
							extend_channel_value = ["l", "u"];
							add_options_x2(document.form.wl_nctrlsb, extend_channel, extend_channel_value, cur_extend_channel);							
						}
						else if(cur_control_channel >= 8 && cur_control_channel <= 11){
							extend_channel = ["<#WLANConfig11b_EChannelBelow#>"];
							extend_channel_value = ["u"];
							add_options_x2(document.form.wl_nctrlsb, extend_channel, extend_channel_value, cur_extend_channel);								
						}
					}
					else{		// 1 ~ 13
						if(cur_control_channel >= 5 && cur_control_channel <= 9){
							extend_channel = ["<#WLANConfig11b_EChannelAbove#>", "<#WLANConfig11b_EChannelBelow#>"];
							extend_channel_value = ["l", "u"];
							add_options_x2(document.form.wl_nctrlsb, extend_channel, extend_channel_value, cur_extend_channel);							
						}
						else if(cur_control_channel >= 10 && cur_control_channel <= 13){
							extend_channel = ["<#WLANConfig11b_EChannelBelow#>"];
							extend_channel_value = ["u"];
							add_options_x2(document.form.wl_nctrlsb, extend_channel, extend_channel_value, cur_extend_channel);								
						}			
					}
				}else{		// -- 20 MHz
					cur_control_channel = cur;
					document.getElementById('wl_nctrlsb_field').style.display = "none";
				}	
						
				chanspecs = wl_channel_list_2g;
			}		
		}
		else if(band == "2"){	// 5 GHz-2 - high band
			wl_channel_list_5g_2 = JSON.parse('<% channel_list_5g_2(); %>');					
			extend_channel = ["<#Auto#>"];		 // for 5GHz, extension channel always displays Auto
			extend_channel_value = [""];		
			if(country != "JP"){		// remove Weather Radar Channel
				if(wl_channel_list_5g_2.getIndexByValue("120") != -1){
					wl_channel_list_5g_2.splice(wl_channel_list_5g_2.getIndexByValue("120"),1);
				}
					
				if(wl_channel_list_5g_2.getIndexByValue("124") != -1){
					wl_channel_list_5g_2.splice(wl_channel_list_5g_2.getIndexByValue("124"),1);
				}
					
				if(wl_channel_list_5g_2.getIndexByValue("128") != -1){
					wl_channel_list_5g_2.splice(wl_channel_list_5g_2.getIndexByValue("128"),1);
				}
			}		

			if(bw_cap == "0"){	// 20/40/80 MHz (auto)
				document.getElementById('wl_nctrlsb_field').style.display = "";
				for(i=0; i<wl_channel_list_5g_2.length; i++){
					var _cur_channel = parseInt(wl_channel_list_5g_2[i]);
					if(_cur_channel == 165 || _cur_channel == 140){		//140, 165 belong to 20MHz
						wl_channel_list_5g_2[i] = _cur_channel;
					}	
					else if(_cur_channel == 132 || _cur_channel == 136){		// belong to 40MHz
						wl_channel_list_5g_2[i] = wlextchannel_fourty(_cur_channel);													
					}						
					else if(country == "TW" && _cur_channel == 56){		//56 belong 20MHz only for TW, due to without channel 52
						wl_channel_list_5g_2[i] = _cur_channel;
					}
					else if(country != "JP" && _cur_channel == 116){		//116 belong 20 MHz, except JP
						wl_channel_list_5g_2[i] = _cur_channel;
					}
					else if(country == "TW" && (_cur_channel == 60 || _cur_channel == 64)){	// belong to 40MHz
						wl_channel_list_5g_2[i] = wlextchannel_fourty(_cur_channel);
					}			
					else if(document.form.wl_nmode_x.value == 1){		// N only
						wl_channel_list_5g_2[i] = wlextchannel_fourty(_cur_channel);
					}
					else{
						if(band5g_11ac_support){
							wl_channel_list_5g_2[i] = _cur_channel + "/80";
						}
						else{		// 11n model, RT-N66U
							wl_channel_list_5g_2[i] = wlextchannel_fourty(_cur_channel);	
						}
					}
				}								
			}
			else if(bw_cap == "3"){	// 80 MHz
				document.getElementById('wl_nctrlsb_field').style.display = "";
				for(i=wl_channel_list_5g_2.length-1;i>=0;i--){
					var _cur_channel = parseInt(wl_channel_list_5g_2[i]);								
					if(_cur_channel == 165){		//remove 165, only belong to 20 MHz
						wl_channel_list_5g_2.splice(wl_channel_list_5g_2.getIndexByValue(_cur_channel),1);
					}
					else if(_cur_channel >= 132 && _cur_channel <= 140 ){		// remove invalid channel under 80 MHz
						wl_channel_list_5g_2.splice(wl_channel_list_5g_2.getIndexByValue(_cur_channel),1);
					}					
					else if(country != "JP"&& _cur_channel == 116){	// remove invalid channel under 80 MHz
						wl_channel_list_5g_2.splice(wl_channel_list_5g_2.getIndexByValue(_cur_channel),1);
					}	
					else if(country == "TW" && _cur_channel >= 56 && _cur_channel <= 64){		// remove invalid channel under 80 MHz, due to without channel 52													
						wl_channel_list_5g_2.splice(wl_channel_list_5g_2.getIndexByValue(wl_channel_list_5g_2[i]),1);
					}
					else{
						wl_channel_list_5g_2[i] = _cur_channel + "/80";
					}	
				}								
			}
			else if(bw_cap == "2"){		// 40 MHz
				document.getElementById('wl_nctrlsb_field').style.display = "";
				for(i=wl_channel_list_5g_2.length-1;i>=0;i--){	
					var _cur_channel = parseInt(wl_channel_list_5g_2[i]);
					if(_cur_channel == 165 || _cur_channel == 140){		//remove 140, 165, only belong to 20MHz
						wl_channel_list_5g_2.splice(wl_channel_list_5g_2.getIndexByValue(_cur_channel),1);
					}
					else if(country != "JP" && _cur_channel == 116){		// remove 116, only under 20 MHz except JP 
						wl_channel_list_5g_2.splice(wl_channel_list_5g_2.getIndexByValue(_cur_channel),1);
					}
					else if(country == "TW" && _cur_channel == 56){			//remove channel 56, due to without channel 52
						wl_channel_list_5g_2.splice(wl_channel_list_5g_2.getIndexByValue(_cur_channel),1);
					}
					else{
						wl_channel_list_5g_2[i] = wlextchannel_fourty(_cur_channel);	
					}	
				}
			}
			else{		//20MHz
				document.getElementById('wl_nctrlsb_field').style.display = "none";					
			}
			
			/*add "Auto" into the option list*/	
			if(wl_channel_list_5g_2[0] != "0")
				wl_channel_list_5g_2.splice(0,0,"0");
			
			add_options_x2(document.form.wl_nctrlsb, extend_channel, extend_channel_value, 1);   //construct extension channel
			chanspecs = wl_channel_list_5g_2;				
		}	//end 5GHz-2 - high band
	} 
	else { // b/g mode 
		chanspecs = new Array(0);
	}

	/* Reconstruct channel array from new chanspecs */
	document.form.wl_channel.length = chanspecs.length;
	if(band == 1 || band == 2){
		for (var i in chanspecs){
			if (chanspecs[i] == 0)
				document.form.wl_channel[i] = new Option("<#Auto#>", chanspecs[i]);
			else
				document.form.wl_channel[i] = new Option(chanspecs[i].toString().replace("/80", "").replace("u", "").replace("l", ""), chanspecs[i]);
			document.form.wl_channel[i].value = chanspecs[i];
			if (chanspecs[i] == cur && bw_cap == '<% nvram_get("wl_bw"); %>'){
				document.form.wl_channel[i].selected = true;
				sel = 1;
			}
		}
		if (sel == 0 && document.form.wl_channel.length > 0)
			document.form.wl_channel[0].selected = true;
	}
	else{
		for(i=0;i< chanspecs.length;i++){
			if(i == 0)
				chanspecs_string[i] = "<#Auto#>";
			else
				chanspecs_string[i] = chanspecs[i];
		}

		add_options_x2(document.form.wl_channel, chanspecs_string, chanspecs, cur_control_channel);
	}
}

function wlextchannel_fourty(v){
	var tmp_wl_channel_5g = "";
	if(v > 144){
		tmp_wl_channel_5g = v - 1;
		if(tmp_wl_channel_5g%8 == 0)
			v = v + "u";
		else		
			v = v + "l";
	}else{
		if(v%8 == 0)
			v = v + "u";
		else		
			v = v + "l";											
	}
	
	return v;
}

var wl1_dfs = '<% nvram_get("wl1_dfs"); %>';
function change_channel(obj){
	var extend_channel = new Array();
	var extend_channel_value = new Array();
	var selected_channel = obj.value;
	var channel_length =obj.length;
	var band = document.form.wl_unit.value;
	if(document.form.wl_bw.value != 1){   // 20/40 MHz or 40MHz
		if(channel_length == 12){    // 1 ~ 11
			if(selected_channel >= 1 && selected_channel <= 4){
				extend_channel = ["<#WLANConfig11b_EChannelAbove#>"];
				extend_channel_value = ["l"];
				add_options_x2(document.form.wl_nctrlsb, extend_channel, extend_channel_value);				
			}
			else if(selected_channel >= 5 && selected_channel <= 7){
				extend_channel = ["<#WLANConfig11b_EChannelAbove#>", "<#WLANConfig11b_EChannelBelow#>"];
				extend_channel_value = ["l", "u"];
				add_options_x2(document.form.wl_nctrlsb, extend_channel, extend_channel_value);							
			}
			else if(selected_channel >= 8 && selected_channel <= 11){
				extend_channel = ["<#WLANConfig11b_EChannelBelow#>"];
				extend_channel_value = ["u"];
				add_options_x2(document.form.wl_nctrlsb, extend_channel, extend_channel_value);								
			}
			else{				//for 0: Auto
				extend_channel = ["<#Auto#>"];
				extend_channel_value = [""];
				add_options_x2(document.form.wl_nctrlsb, extend_channel, extend_channel_value);
			}
		}
		else{		// 1 ~ 13
			if(selected_channel >= 1 && selected_channel <= 4){
				extend_channel = ["<#WLANConfig11b_EChannelAbove#>"];
				extend_channel_value = ["l"];
				add_options_x2(document.form.wl_nctrlsb, extend_channel, extend_channel_value);							
			}
			else if(selected_channel >= 5 && selected_channel <= 9){
				extend_channel = ["<#WLANConfig11b_EChannelAbove#>", "<#WLANConfig11b_EChannelBelow#>"];
				extend_channel_value = ["l", "u"];
				add_options_x2(document.form.wl_nctrlsb, extend_channel, extend_channel_value);							
			}
			else if(selected_channel >= 10 && selected_channel <= 13){
				extend_channel = ["<#WLANConfig11b_EChannelBelow#>"];
				extend_channel_value = ["u"];
				add_options_x2(document.form.wl_nctrlsb, extend_channel, extend_channel_value);								
			}
			else{				//for 0: Auto
				extend_channel = ["<#Auto#>"];
				extend_channel_value = [""];
				add_options_x2(document.form.wl_nctrlsb, extend_channel, extend_channel_value);
			}
		}
	}
	
	if(band == 1){
		if(country == "EU"){		// for DFS channel
			if(based_modelid == "RT-AC68U" || based_modelid == "RT-AC68A" || based_modelid == "4G-AC68U" || based_modelid == "DSL-AC68U"
			|| (based_modelid == "RT-AC66U" && wl1_dfs == "1")
			|| based_modelid == "RT-N66U"){
				if(document.form.wl_channel.value  == 0){
					document.getElementById('dfs_checkbox').style.display = "";
					document.form.acs_dfs.disabled = false;
				}	
				else{
					document.getElementById('dfs_checkbox').style.display = "none";
					document.form.acs_dfs.disabled = true;
				}
			}
			else if(based_modelid == "RT-AC87U"){
				if(document.form.wl_channel.value  == "0"){
					if(document.form.wl_bw.value == "1"){
						document.getElementById('dfs_checkbox').style.display = "none";
						document.form.acs_dfs.disabled = true;
					}
					else{
						document.getElementById('dfs_checkbox').style.display = "";
						document.form.acs_dfs.disabled = false;
					}
				}
				else{
					document.getElementById('dfs_checkbox').style.display = "none";
					document.form.acs_dfs.disabled = true;
				}				
			}
		}
		else if(country == "US" || country == "SG"){			//for acs band1 channel
			if(based_modelid == "RT-AC68U" || based_modelid == "RT-AC68A" || based_modelid == "4G-AC68U" || based_modelid == "DSL-AC68U"
			|| based_modelid == "RT-AC56U" || based_modelid == "RT-AC56S"
			|| based_modelid == "RT-AC66U"
			|| based_modelid == "RT-N66U"
			|| based_modelid == "RT-AC53U"){
				if(document.form.wl_channel.value  == 0){
					document.getElementById('acs_band1_checkbox').style.display = "";
					document.form.acs_band1.disabled = false;
				}	
				else{
					document.getElementById('acs_band1_checkbox').style.display = "none";
					document.form.acs_band1.disabled = true;
				}
			}
		}
	}
	else if(band == 0){
		if(country == "EU" || country == "JP" || country == "SG" || country == "CN" || country == "UA" || country == "KR"){
			if(!Qcawifi_support && !Rawifi_support){
				if(document.form.wl_channel.value  == '0'){
					document.getElementById('acs_ch13_checkbox').style.display = "";
					document.form.acs_ch13.disabled = false;					
				}
				else{
					document.getElementById('acs_ch13_checkbox').style.display = "none";
					document.form.acs_ch13.disabled = true;							
				}
			}
		}
	}	
}
