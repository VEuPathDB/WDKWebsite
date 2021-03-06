
/*
we support two types of toggling, one compatible with Safari the other for the rest of the 
browsers. 

the version that works on Safari causes Netscape to lose focus on a click.

the version that works on Netscape doesn't work at all on Safari, as it seems the DOM tricks
in sayShowOrHide don't work

*/

wdk.namespace("window.wdk.api", function(ns, $) {
  "use strict";

  // used by Firefox
  // gene page, cookie set to expire a year from today
  function toggleLayer(controllingLayerName, textLayerName) {
    //alert("toggleLayer: " + controllingLayerName);
    var controllingLayer ; 
    if (document.getElementById) {    // this is the way the standards work
      controllingLayer = document.getElementById(controllingLayerName);
    } else if (document.all) {  // this is the way old msie versions work
      controllingLayer = document.all[controllingLayerName];
    } else if (document.layers) {   // this is the way nn4 works
      controllingLayer  = document.layers[controllingLayerName];
    }
    var style = controllingLayer.style;
    style.display = style.display? "":"block";   // toggle it
    sayShowOrHide(controllingLayerName, textLayerName, style);
    storeIntelligentCookie("show" + controllingLayerName, style.display == "block"? 1:0,365);
  }

  function sayShowOrHide(controllingLayerName, textLayerName, style) {
    var content = style.display == "block"? "Hide" : "Show";
    // don't use # shortcut for id lookup here...special characters
    // in element id cause problems, and for some reason escaping
    // with \\ (as spec'd in jquery docs) is not working.
    $("div[id='" + textLayerName + "'] a:first").text(content);
    return true;
  }

  function showLayer(whichLayer) {
    var style2;
    //alert("showLayer: " + whichLayer);
    if (document.getElementById) {
      // this is the way the standards work
      style2 = document.getElementById(whichLayer).style;
      style2.display = "block";
    } else if (document.all) {
      // this is the way old msie versions work
      style2 = document.all[whichLayer].style;
      style2.display = "block";
    } else if (document.layers) {
      // this is the way nn4 works
      style2 = document.layers[whichLayer].style;
      style2.display = "block";
    }
    return true;
  }

  function hideLayer(whichLayer) {
    var style2;
    //alert("hideLayer: " + whichLayer);
    if (document.getElementById) {
      // this is the way the standards work
      style2 = document.getElementById(whichLayer).style;
      style2.display = "";
    } else if (document.all) {
      // this is the way old msie versions work
      style2 = document.all[whichLayer].style;
      style2.display = "";
    } else if (document.layers) {
      // this is the way nn4 works
      style2 = document.layers[whichLayer].style;
      style2.display = "";
    }
    return true;
  }

  function getCookie(name) {
    var start = document.cookie.indexOf(name + "=");

    if ( (!start) && name != document.cookie.substring(0,name.length) ) {
      return null;
    }

    if (start == -1) {
      return null;
    }

    var len = start + name.length + 1;
    var end = document.cookie.indexOf(";",len);
    if (end == -1) {
      end = document.cookie.length;
    }

    return decodeURI(document.cookie.substring(len,end));
  }

  function setCookie(name, value, days, path, domain, secure) {
    // alert(name + "=" + escape(value) +
    //       ( (expires) ? ";expires=" + expires.toGMTString() : "") +
    //       ( (path) ? ";path=" + path : "") + 
    //       ( (domain) ? ";domain=" + domain : "") +
    //       ( (secure) ? ";secure" : ""));

    var expiresDate = new Date((new Date()).getTime() + 1000 * 60 * 60 * 24 * days);

    document.cookie = name + "=" + encodeURI(value) +
        ( (days) ? ";expires=" + expiresDate.toGMTString() : "") +
        ( (path) ? ";path=" + path : "") + 
        ( (domain) ? ";domain=" + domain : "") +
        ( (secure) ? ";secure" : "");

  }

  function deleteCookie(name, path, domain) {
    if (getCookie(name)) {
      document.cookie = name + "=" +
          ( (path) ? ";path=" + path : "") +
          ( (domain) ? ";domain=" + domain : "") +
          ";expires=Thu, 01-Jan-70 00:00:01 GMT";
    }
  }

  var today = new Date();
  var zeroDate = new Date(0,0,0);
  today.setTime(today.getTime() - zeroDate.getTime());

  function storeMasterCookie() {
    if (!getCookie('MasterCookie')) {
      setCookie('MasterCookie','MasterCookie');
    }
  }


  //cookie will expire in these many days
  function storeIntelligentCookie(name, value, days, path, domain, secure) {
    if (!getCookie('MasterCookie')) {
      storeMasterCookie();
    }
    var IntelligentCookie = getCookie(name);
    if ((!IntelligentCookie) || (IntelligentCookie != value)) {
      setCookie(name, value, days, path, domain, secure);
      IntelligentCookie = getCookie(name);
      if ((!IntelligentCookie) || (IntelligentCookie != value)) {
        deleteCookie('MasterCookie');
      }
    }
  }

  function multiSelectAll(bool, form, node) {
    var opt = form[node];
    opt[0].selected = (bool ? null : 'selected');
    for (var i=0; i<opt.length; i++) {
      opt[i].selected = (bool ? 'selected' : null);
    }
  }



  function handleHttpResponseImage(imgId, imgSrc) {
    var http = httpObjects[imgId];
    var msg = "in handleHttpResponseImage\n" +
        "http = " + http + "\n" +
        "state = " + http.readyState + "\n" +
        "imgId = " + imgId + "\n" +
        "imgSrc = " + imgSrc;

    // no need to wait till readyState == 4 'cuz we do not need responseText
    if (http.readyState == 1 || http.readyState === 0) {
      var img = document.getElementById(imgId);
      msg += "\nimg before='" + img + "'\n";
      if(img.src && img.src != imgSrc) {
        img.src = imgSrc;
      }
      msg += "\nsrc after='" + img.src + "'\n";
      workStates[imgId] = false;
    }
    //alert(msg);
  }

  function updateImage(imgId, imgSrc) {
    var http = getHTTPObject();
    httpObjects[imgId] = http;
    var isWorking = false;
    workStates[imgId] = isWorking;

    if (!isWorking && http) {
      //if imgSrc is on a different domain, we need to sign the scripts and ask for expanded privilege
      try {
        netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead"); // jshint ignore:line
      } catch (e) {
        //alert("cat not enable UniversalBrowserRead: " + e.message);
      }
      try {
        http.open("GET", imgSrc, true);
        http.onreadystatechange = handleHttpResponseImage(imgId, imgSrc);
        workStates[imgId] = true;
        http.send(null);
      } catch (e) {
        var img = document.getElementById(imgId);
        if (img.src && img.src != imgSrc) {
          img.src = imgSrc;
        }
      }
    }
    workStates[imgId] = false;
    return true;
  }

  function updateDiv(divId, urlToLoad, errorMsg) {
    $.ajax({
      url: urlToLoad,
      type: "GET",
      data: {},
      dataType: "html",
      success: function(data){
        $('#'+divId).html(data);
      },
      error: function (jqXHR, textStatus, errorThrown) {
        alert(errorMsg + "\n" + textStatus + "\n" + errorThrown);
      }
    });
  }

  function handle_dnaContextDiv() {
    handleHttpResponseImageMapDiv('dnaContextDiv');
  }

  function handle_proteinFeaturesDiv() { 
    handleHttpResponseImageMapDiv('proteinFeaturesDiv');
  }

  function handleHttpResponseImageMapDiv(imgMapDivId) {
    var http = httpObjects[imgMapDivId];
    if (http.readyState == 4) {
      if (!document.getElementById(imgMapDivId).lastChild) {
        //document.getElementById(imgMapDivId).innerHTML = http.responseText;
        //TRICKY: this only works on Firefox/Netscape
        dynamiccontent(imgMapDivId, http.responseText);
      }
      workStates[imgMapDivId] = false;
    }
    //alert(imgMapDivId + ": state=" + http.readyState);
  }

  function dynamiccontent(elementid,content){
    if (document.getElementById && !document.all) {
      var rng = document.createRange();
      var el = document.getElementById(elementid);
      rng.setStartBefore(el);
      var htmlFrag = rng.createContextualFragment(content);
      while (el.hasChildNodes()) {
        el.removeChild(el.lastChild);
      }
      el.appendChild(htmlFrag);
    }
  }

  function updateImageMapDiv(imgMapDivId, imgMapSrc, postLoadJS) {

    var http = getHTTPObject();
    httpObjects[imgMapDivId] = http;

    var slot = "#" + imgMapDivId;

    var isWorking = false;
    workStates[imgMapDivId] = isWorking;

    var loadingImg = ($("<div></div>")
        .attr("id", "imgMapDivId_loading"))
        .attr("class", "gbGnCtx")
        .append($("<img/>")
        .attr("src", wdk.assetsUrl("wdk/images/loading.gif")))
        .append("<br>Loading...");


    // cris, 2-4-11. fixes #2430
    if (!isWorking && http) {
      //if($('div#imgMapDivId_loading').length == 0) {    
      //  $('#imgMapDivId_loading').remove();
      $(slot).append(loadingImg);
      //}
 
      $(slot).load(imgMapSrc, null, function() {
        $.each(postLoadJS.split(','), function (i, val) {
          if (val.indexOf("wz_tooltip") != -1) {
            $("div[id^=tOoLtIp]").remove(); // previously loaded wz_tooltips
          }
          var js = document.createElement('script');
          //js.setAttribute("type","text/javascript");
          //js.setAttribute("src", val);
          js = $(document.createElement('script'))
              .attr("type", "text/javascript")
              .attr("src", val);
          $(slot).append(js);
        });
      });
       
      $().ajaxError(function(info,xhr){
        $(imgMapDivId).append("Oops: " +  xhr.status + ' ' + xhr.statusText);
      });

    }
    workStates[imgMapDivId] = false;
    return true;
  }

  function getHTTPObject() {
    var xmlhttp;
    /*@cc_on
    @if (@_jscript_version >= 5)
        try {
            xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");
        } catch (e) {
            try {
                xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
            } catch (E) {
                xmlhttp = false;
            }
        }
    @else
        xmlhttp = false;
    @end @*/

    if (!xmlhttp && typeof XMLHttpRequest != 'undefined') {
      try {
        xmlhttp = new XMLHttpRequest();
      } catch (e) {
        xmlhttp = false;
      }
    }
    return xmlhttp;
  }

  var httpObjects = {}; // a hash of XMLHttpObjects
  var workStates = {};  // a hash of XMLHttpObjects working status


  /* ==========================================================================
   * The following ajax methods are defined to fetch sub-pages
   * ========================================================================== */

  function requestAsyncContent(url, contentTag) {
    // construct request
    var request;
    if (window.XMLHttpRequest) {    // firefox, mozilla, IE7
      request = new XMLHttpRequest();
    } else if (window.ActiveXObject) {    // IE6 or before
      request = new ActiveXObject("Microsoft.XMLHTTP"); // jshint ignore:line
    } else {
      return null;
    }
     
    request.open("GET", url, true);
    
    // construct callback wrapper
    function callbackWrapper() {
      if (request.readyState == 4) {
        receiveAsyncContent(request, contentTag);
      }
    }
    request.onreadystatechange = callbackWrapper;
    
    request.send(null);
  }

  function receiveAsyncContent(request, contentTag) {
    var content = document.getElementById(contentTag);
    if (request.status == 200) {    // success
      content.innerHTML = request.responseText;
    } else {    // http failure
      content.innerHTML = "Failed. Cannot retrieve the content.";
    }
  }

  // return domain.org from www.domain.org
  function secondLevelDomain() {
    var dm = document.domain.split(/\./);
    if (dm.length > 1) {
      return(dm[dm.length-2] + "." +  dm[dm.length-1]) ;
    } else {
      return("");
    }
  }

  function checkboxAll(field) {
    for (var i = 0; i < field.length; i++) {
      field[i].checked = true ;
    }
  }

  function checkboxNone(field) {
    for (var i = 0; i < field.length; i++) {
      field[i].checked = false ;
    }
  }


  ns.toggleLayer = toggleLayer;
  ns.sayShowOrHide = sayShowOrHide;
  ns.showLayer = showLayer;
  ns.hideLayer = hideLayer;
  ns.getCookie = getCookie;
  ns.setCookie = setCookie;
  ns.deleteCookie = deleteCookie;
  ns.storeMasterCookie = storeMasterCookie;
  ns.storeIntelligentCookie = storeIntelligentCookie;
  ns.multiSelectAll = multiSelectAll;
  ns.handleHttpResponseImage = handleHttpResponseImage;
  ns.updateImage = updateImage;
  ns.updateDiv = updateDiv;
  ns.handle_dnaContextDiv = handle_dnaContextDiv;
  ns.handle_proteinFeaturesDiv = handle_proteinFeaturesDiv;
  ns.handleHttpResponseImageMapDiv = handleHttpResponseImageMapDiv;
  ns.dynamiccontent = dynamiccontent;
  ns.updateImageMapDiv = updateImageMapDiv;
  ns.getHTTPObject = getHTTPObject;
  ns.requestAsyncContent = requestAsyncContent;
  ns.receiveAsyncContent = receiveAsyncContent;
  ns.secondLevelDomain = secondLevelDomain;
  ns.checkboxAll = checkboxAll;
  ns.checkboxNone = checkboxNone;

});
