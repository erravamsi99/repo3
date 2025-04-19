const BG_TRACKER_BASE_URL = "https://track.bixgrow.com/api";

let isWebPixelLoaded = localStorage.getItem("isWebPixelLoaded");

if (!isWebPixelLoaded) {
  localStorage.setItem("isAppEmbedLoaded", true);
  const bgRefCode = bgGetParameterByName("bg_ref");

  let bgVisitorId = bgGetCookie("bgvisitor_id");
  let affiliateId = bgGetCookie("bgaffilite_id");
  let lastClick = bgGetCookie("bglast_click");

  applyAutomaticDiscount(bgRefCode, affiliateId);
  if (bgRefCode) {
    if (bgVisitorId === "") {
      console.log(1);
      let payload = {
        aff_id: bgRefCode,
        event_type: "click",
        referral_site: document.referrer,
        destination_url: window.location.href,
      };
      bgPostEvent(payload);
    } else {
      if (affiliateId != bgRefCode) {
        console.log(2);
        let payload = {
          aff_id: bgRefCode,
          visitor_id: bgVisitorId,
          event_type: "click",
          referral_site: document.referrer,
          destination_url: window.location.href,
        };
        bgPostEvent(payload);
      } else {
        if (new Date().getTime() - lastClick > 60 * 1000) {
          console.log(3);
          let payload = {
            aff_id: bgRefCode,
            visitor_id: bgVisitorId,
            event_type: "click",
            referral_site: document.referrer,
            destination_url: window.location.href,
          };
          bgPostEvent(payload);
        }
      }
    }
  }

  var bgSetInterval = setInterval(function () {
    let currentShopifyCart = bgGetCookie("cart");
    if (
      bgGetCookie("bgvisitor_id") !== "" &&
      currentShopifyCart !== "" &&
      bgGetCookie("bgcart") != bgGetCookie("cart")
    ) {
      console.log("aaaaa");
      bgSetCookie("bgcart", currentShopifyCart, 100);
      clearInterval(bgSetInterval);
      let payload = {
        aff_id: bgGetCookie("bgaffilite_id"),
        visitor_id: bgGetCookie("bgvisitor_id"),
        event_type: "add_to_cart",
        cart_token: sanitizeCartCookie(currentShopifyCart),
        click_id: bgGetCookie("bgclick_id"),
      };
      bgPostEvent(payload);
    }
  }, 1000);

  async function applyAutomaticDiscount(bgRefCode, affiliateIdFromCookies) {
    let affiliateId = bgRefCode || affiliateIdFromCookies;
    if (!affiliateId) {
      return 1;
    }
    const apiURl = `${BG_TRACKER_BASE_URL}/automatic-coupon-customer?shop=${Shopify.shop}&affiliateId=${affiliateId}`;
    try {
      const response = await fetch(apiURl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        console.log("Bixgrow - network response was not ok");
      }

      const responseData = await response.json().catch(() => null);
      if (!responseData) {
        return;
      }
      if (responseData?.couponCode) {
        autoAppliedCoupon(responseData?.couponCode);
      }
    } catch (error) {
      console.error("Bixgrow - error:", error);
    }
  }

function autoAppliedCoupon(discountCode){
  discountCode = encodeURIComponent(discountCode);
    try{
      const url = `https://${shopDomainTracker}/discount/${discountCode}`;
      bgUseFetch(url,'GET');
    }catch(error){
      console.log(error);
    }
  }

  async function bgUseFetch(url, method = "GET",params = null,headers = { "Content-Type": "application/json"} ){
    try {
      const options = {
        method: method,
        headers: {
          ...headers
        }
      }
      if(params){
        if(method == 'GET'){
          const queryString = new URLSearchParams(params).toString();
          url += '?' + queryString;
        }else{
          options.body = JSON.stringify(params);
        }
      }
      const response = await fetch(url,options);
      if(!response.ok){
        throw new Error(response.statusText);
      }
      const responseData = await response.json().catch(() => null);
      if(responseData){
        return responseData;
      }
    } catch (error) {
       throw error;
    }
    
  }

  function sanitizeCartCookie(cartValue) {
    if (!cartValue) return cartValue;
    return cartValue.split("?")[0];
  }

  function bgGetCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(";");
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == " ") {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  }

  function bgSetCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
  }

  function bgGetParameterByName(name, url = window.location.href) {
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
      results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return "";
    return decodeURIComponent(results[2].replace(/\+/g, " "));
  }

  async function bgPostEvent(data) {
    const apiURl = `${BG_TRACKER_BASE_URL}/bg_trackv2`;
    try {
      const response = await fetch(apiURl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        console.log("Bixgrow - network response was not ok");
      }

      const responseData = await response.json();
      if (
        responseData.event_type == "click" &&
        typeof responseData.visitor_id !== "undefined"
      ) {
        bgSetCookieByUnixTime(
          "bgvisitor_id",
          responseData.visitor_id,
          responseData.expire_at
        );
        bgSetCookieByUnixTime(
          "bgaffilite_id",
          data.aff_id,
          responseData.expire_at
        );
        bgSetCookieByUnixTime(
          "bglast_click",
          new Date().getTime(),
          responseData.expire_at
        );
        bgSetCookieByUnixTime(
          "bgexpire_time",
          responseData.expire_at,
          responseData.expire_at
        );
        bgSetCookieByUnixTime(
          "bgclick_id",
          responseData.click_id,
          responseData.expire_at
        );
      } else if (responseData.event_type == "add_to_cart") {
        clearInterval(bgSetInterval);
      }
    } catch (error) {
      console.error("Bixgrow - error:", error);
    }
  }

  function bgSetCookieByUnixTime(cname, cvalue, unixTime) {
    var d = new Date(unixTime * 1000);
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
  }

  console.log(
    `%c ► Bixgrow:App embed tracker`,
    "background-color: #f90; color: #fff; padding: 5px;"
  );
} else {
  console.log("Web pixel already loaded, skipping...");
  localStorage.removeItem("isWebPixelLoaded");
}
