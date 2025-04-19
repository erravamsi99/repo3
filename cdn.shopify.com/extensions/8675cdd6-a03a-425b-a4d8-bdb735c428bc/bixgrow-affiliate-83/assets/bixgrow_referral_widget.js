var bixgrowReferralUrl = 'https://api.bixgrow.com';
var bixgrowTrackingUrl = 'https://track.bixgrow.com';

var myDataSetting = null;

window.bgIsEmbedWidgetLoaded = true;
if (!window.bgIsScripttagWidgetLoaded) {
  bgGetDataReferral();
}

let bgAdParameter = bgGetParameterByName("ad_id");
if (bgAdParameter) {
  let xhttp = new XMLHttpRequest();
  xhttp.open("POST", bixgrowTrackingUrl + "/api/referral/friends/reward", true);
  xhttp.setRequestHeader("Content-Type", "application/json");
  let data = {
    shop: Shopify.shop,
    advocate_id: bgAdParameter,
    url: window.location.href,
    visitor_id: bgGetCookie("bgrf_visitor_id"),
    is_same_browser: bgGetCookie("bg_is_same_browser") ? true : false,
  };
  xhttp.send(JSON.stringify(data));
  xhttp.onload = function () {
    if (this.status === 200) {
      let obj = JSON.parse(this.responseText);
      if (Object.keys(obj).length > 0) {
        bgSetCookie("bgrf_visitor_id", obj.visitor_id, 30);
        myDataSetting = obj;
        if (obj.discount?.code) {
          createFriendRewardPopup(obj);
          autoAppliedCoupon(obj.discount.code);
        } else {
          createBeforeRedemFriendRewardPopup(obj);
        }
        // createFriendRewardPopup(obj);
        // autoAppliedCoupon(obj.discount.code);
      }
    } else if (this.status == 400) {
      let errorObj = JSON.parse(this.responseText);
      if (errorObj.status == "INVALID_REFERRAL_LINK") {
        createInvalidReferralLinkPopup(errorObj.data);
      } else {
      }
    }
  };
}

function createFriendRewardPopup(obj) {
  let bgHead = document.head || document.getElementsByTagName("head")[0];
  let myBgModal = document.getElementById("myBgModal");
  if (myBgModal) {
    myBgModal.remove();
  }
  let referralDiv = document.createElement("div");
  referralDiv.id = "myBgModal";
  referralDiv.classList.add("bg-modal");
  document.body.appendChild(referralDiv);
  let bgStyle = document.createElement("style");
  let bgCss = `.bg-modal{
    display:none;
    position:fixed;
    z-index:9999;
    padding-top:100px;
    left:0;
    top:0;
    width:100%;
    height:100%;
    overflow:scroll;
    background-color: rgb(0,0,0,0.25);
    -webkit-animation-name: bganimatefade;
    -webkit-animation-duration: 0.4s;
    animation-name: bganimatefade;
    animation-duration: 0.4s
   }
   .bg-modal-content{
    width: 500px;
    background: ${obj.page_settings.appearance.background || "#fefefe"};
    margin:auto;
    padding:30px 24px 20px 25px;
    border-radius:16px;
    text-align:center;
    color:#1B283F;
    position: relative;
    width: 600px;
    border-radius: 0px;
    padding: 30px 40px;
   }
   .bg-heading{
    font-size:20px;
    font-weight:700;
    margin-bottom: 15px;
    color: ${obj.page_settings.appearance.text || "rgb(0, 0, 0)"};
    font-size: 38px;
    font-weight: 650;
    line-height: normal;
   }
   .bg-content{
    font-size:14px;
    margin-bottom:24px;
    color: ${obj.page_settings.appearance.text || "rgb(0, 0, 0)"};
    font-size: 21px;
    font-weight: 450;
    line-height: normal;
   }
   .bg-input-wrapper{
    margin-bottom: 24px;
    position:relative;
    cursor:pointer;
   }
   .bg-input-wrapper .bg-input{
    padding:16px 18px;
    height:50px;
    width: 100%;
    background:#F7F7F7;
    border: 2px dashed #81868B;
    box-shadow:none;
    box-sizing: border-box;
    -webkit-box-sizing: border-box;
    cursor: pointer;
    font-size:18px;
    line-height: normal;
   }
   .bg-input:focus{
    outline: 0;
   }
   .bg-btn{
    border: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    white-space: nowrap;
    border-radius: 4px;
    width: 100%;
    padding: 13px 16px;
    color: rgba(255, 255, 255, 1);
    background: #1B283F;
    line-height:normal;
    font-size:21px;
    cursor:pointer;
   }
   .bg-btn-dark{
    background: ${obj.page_settings.appearance.button.background || "#1B283F"};
    color: ${obj.page_settings.appearance.button.text};
   }
   .bg-input-wrapper::after{
    content: attr(data-copy);
    position: absolute;
    display: flex;
    align-items: center;
    right: 18px;
    top: 0;
    height: 100%;
    font-size: 14px;
    color:#036ADA;
   }
   .bg-close{
    position:absolute;
    top:18px;
    right:21px;
    cursor:pointer;
   }
   .bg-powered-by-container{
    text-align: center;
    margin-bottom: 7px;
  }
  .bg-powered-by-text{
      color: #ffff;
      padding: 4px 19px;
      font-size: 14px;
      background: rgba(0,0,0,.15);
      font-weight: 600;
      border-radius: 15px;
      text-decoration: none;
  }

  @-webkit-keyframes bganimatefade {
    from {opacity:0}
    to {opacity:1}
  }

  @keyframes bganimatefade {
    from {opacity:0}
    to {opacity:1}
  }
  .bg-discount-expired{
    color: #81868b;
    text-align: center;
    margin-top:5px;
    font-size:13px;
  }
  @media (max-width: 600px) {
    .bg-modal-content{
      width: 100%;
      border-radius: 0;
      padding:20px;
    }
    .bg-heading{
      font-size: 30px;
    }
    .bg-content{
      font-size: 18px;
    }
    .bg-btn{
      font-size: 18px;
    }
  }
   `;

  bgStyle.type = "text/css";
  if (bgStyle.styleSheet) {
    bgStyle.styleSheet.cssText = css;
  } else {
    bgStyle.appendChild(document.createTextNode(bgCss));
  }
  bgHead.appendChild(bgStyle);
  let bgModalContent = `
 ${
   !obj.page_settings.appearance.is_hide_brand_bixgrow
     ? `<div class="bg-powered-by-container">
 <span class="bg-powered-by-text">Powered by BixGrow</span>
 </div>`
     : ""
 }
 <div class="bg-modal-content">
 <svg id="bg-close" class="bg-close" style="width:12px;height:12px" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
<path d="M7.06045 5.99999L11.7803 1.28068C12.0732 0.987705 12.0732 0.512692 11.7803 0.219735C11.4873 -0.0732451 11.0123 -0.0732451 10.7193 0.219735L5.99999 4.93953L1.28068 0.219735C0.987705 -0.0732451 0.512692 -0.0732451 0.219735 0.219735C-0.0732217 0.512716 -0.0732451 0.987728 0.219735 1.28068L4.93953 5.99999L0.219735 10.7193C-0.0732451 11.0123 -0.0732451 11.4873 0.219735 11.7803C0.512716 12.0732 0.987728 12.0732 1.28068 11.7803L5.99999 7.06045L10.7193 11.7803C11.0123 12.0732 11.4873 12.0732 11.7802 11.7803C12.0732 11.4873 12.0732 11.0123 11.7802 10.7193L7.06045 5.99999Z" fill="#1B283F"/>
</svg>
  <div class="bg-heading">${
    obj.page_settings.content.coupon_display_page.headline
  }</div>
  <div class="bg-content">${
    obj.page_settings.content.coupon_display_page.description
  }</div>
  <div id="bg-input-wrapper" class="bg-input-wrapper" data-copy="${obj.page_settings.content.coupon_display_page.copy}">
  <input id="bg-input" class="bg-input" readonly value="${obj.discount.code}">
  </div>
  <button type="button" id="bg-btn-shop-now" class="bg-btn bg-btn-dark">${
    obj.page_settings.content.coupon_display_page.button
  }</button>
  ${
    obj.discount.price_rule.ends_at_time
      ? `<div class="bg-discount-expired">${obj.discount.price_rule.ends_at_time.replace(
          "{end_date}",
          detectDateFormat(obj.discount.price_rule.ends_at)
        )}</div>`
      : ""
  }
 </div>`;
  referralDiv.insertAdjacentHTML("beforeend", bgModalContent);
  let bgClose = document.getElementById("bg-close");
  bgClose.addEventListener("click", function ($event) {
    referralDiv.style.display = "none";
  });
  let myBtn = document.getElementById("bg-btn-shop-now");
  myBtn.addEventListener("click", function () {
    referralDiv.style.display = "none";
  });
  let bgInputWrapper = document.getElementById("bg-input-wrapper");
  bgInputWrapper.addEventListener("click", function ($event) {
    let bgInput = document.getElementById("bg-input");
    bgInput.select();
    document.execCommand("copy");
    bgInputWrapper.setAttribute("data-copy", obj.page_settings.content.coupon_display_page.copied);
    setTimeout(() => {
      bgInputWrapper.setAttribute("data-copy", obj.page_settings.content.coupon_display_page.copy);
    }, 1500);
  });
  referralDiv.style.display = "block";
}

function createInvalidReferralLinkPopup(obj) {
  let bgHead = document.head || document.getElementsByTagName("head")[0];
  let myBgModal = document.getElementById("myBgModal");
  if (myBgModal) {
    myBgModal.remove();
  }
  let referralDiv = document.createElement("div");
  referralDiv.id = "myBgModal";
  referralDiv.classList.add("bg-modal");
  document.body.appendChild(referralDiv);
  let bgStyle = document.createElement("style");
  let bgCss = `.bg-modal{
    display:none;
    position:fixed;
    z-index:9999;
    padding-top:100px;
    left:0;
    top:0;
    width:100%;
    height:100%;
    overflow:scroll;
    background-color: rgb(0,0,0,0.25);
    -webkit-animation-name: bganimatefade;
    -webkit-animation-duration: 0.4s;
    animation-name: bganimatefade;
    animation-duration: 0.4s
   }
   .bg-modal-content{
    width: 500px;
    background: ${obj.page_settings.appearance.background || "#fefefe"};
    margin:auto;
    padding:30px 24px 20px 25px;
    border-radius:16px;
    text-align:center;
    color:#1B283F;
    position: relative;
    width: 600px;
    border-radius: 0px;
    padding: 30px 40px;
   }
   .bg-heading{
    font-size:20px;
    font-weight:700;
    margin-bottom: 15px;
    color: ${obj.page_settings.appearance.text || "rgb(0, 0, 0)"};
    font-size: 38px;
    font-weight: 650;
    line-height: normal;
   }
   .bg-content{
    font-size:14px;
    margin-bottom:24px;
    color: ${obj.page_settings.appearance.text || "rgb(0, 0, 0)"};
    font-size: 21px;
    font-weight: 450;
    line-height: normal;
   }

   .bg-btn{
    border: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    white-space: nowrap;
    border-radius: 4px;
    width: 100%;
    padding: 13px 16px;
    color: rgba(255, 255, 255, 1);
    background: #1B283F;
    line-height:normal;
    font-size:21px;
    cursor:pointer;
   }
   .bg-btn-dark{
    background: ${obj.page_settings.appearance.button.background || "#1B283F"};
    color: ${obj.page_settings.appearance.button.text};
   }

   .bg-close{
    position:absolute;
    top:18px;
    right:21px;
    cursor:pointer;
   }
   .bg-powered-by-container{
    text-align: center;
    margin-bottom: 7px;
  }
 
  @-webkit-keyframes bganimatefade {
    from {opacity:0} 
    to {opacity:1}
  }
  
  @keyframes bganimatefade {
    from {opacity:0}
    to {opacity:1}
  }
  @media (max-width: 600px) {
    .bg-modal-content{
      width: 100%;
      border-radius: 0;
      padding:20px;
    }
    .bg-heading{
      font-size: 30px;
    }
    .bg-content{
      font-size: 18px;
    }
    .bg-btn{
      font-size: 18px;
    }
  }
   `;

  bgStyle.type = "text/css";
  if (bgStyle.styleSheet) {
    bgStyle.styleSheet.cssText = css;
  } else {
    bgStyle.appendChild(document.createTextNode(bgCss));
  }
  bgHead.appendChild(bgStyle);
  let bgModalContent = `
 <div class="bg-modal-content">
 <svg id="bg-close" class="bg-close" style="width:12px;height:12px" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
<path d="M7.06045 5.99999L11.7803 1.28068C12.0732 0.987705 12.0732 0.512692 11.7803 0.219735C11.4873 -0.0732451 11.0123 -0.0732451 10.7193 0.219735L5.99999 4.93953L1.28068 0.219735C0.987705 -0.0732451 0.512692 -0.0732451 0.219735 0.219735C-0.0732217 0.512716 -0.0732451 0.987728 0.219735 1.28068L4.93953 5.99999L0.219735 10.7193C-0.0732451 11.0123 -0.0732451 11.4873 0.219735 11.7803C0.512716 12.0732 0.987728 12.0732 1.28068 11.7803L5.99999 7.06045L10.7193 11.7803C11.0123 12.0732 11.4873 12.0732 11.7802 11.7803C12.0732 11.4873 12.0732 11.0123 11.7802 10.7193L7.06045 5.99999Z" fill="#1B283F"/>
</svg>
  <div class="bg-heading">${obj.page_settings.content.headline}</div>
  <div class="bg-content">${obj.page_settings.content.description}</div>
  <button type="button" id="bg-btn-shop-now" class="bg-btn bg-btn-dark">${obj.page_settings.content.button}</button>
 </div>`;
  referralDiv.insertAdjacentHTML("beforeend", bgModalContent);
  let bgClose = document.getElementById("bg-close");
  bgClose.addEventListener("click", function ($event) {
    referralDiv.style.display = "none";
  });
  let myBtn = document.getElementById("bg-btn-shop-now");
  myBtn.addEventListener("click", function () {
    referralDiv.style.display = "none";
  });
  referralDiv.style.display = "block";
}

function createBeforeRedemFriendRewardPopup(obj) {
  let bgHead = document.head || document.getElementsByTagName("head")[0];
  let myBgModal = document.getElementById("myBgModal");
  if (myBgModal) {
    myBgModal.remove();
  }
  let referralDiv = document.createElement("div");
  referralDiv.id = "myBgModal";
  referralDiv.classList.add("bg-modal");
  document.body.appendChild(referralDiv);
  let bgStyle = document.createElement("style");
  let bgCss = `.bg-modal{
  display:none;
  position:fixed;
  z-index:9999;
  padding-top:100px;
  left:0;
  top:0;
  width:100%;
  height:100%;
  overflow:scroll;
  background-color: rgb(0,0,0,0.25);
  -webkit-animation-name: bganimatefade;
  -webkit-animation-duration: 0.4s;
  animation-name: bganimatefade;
  animation-duration: 0.4s
 }
 .bg-modal-content{
  width: 500px;
  background: ${obj.page_settings.appearance.background || "#fefefe"};
  margin:auto;
  padding:30px 24px 20px 25px;
  border-radius:16px;
  text-align:center;
  color:#1B283F;
  position: relative;
  width: 600px;
  border-radius: 0px;
  padding: 30px 40px;
 }
 .bg-heading{
  font-size:20px;
  font-weight:700;
  margin-bottom: 15px;
  color: ${obj.page_settings.appearance.text || "rgb(0, 0, 0)"};
  font-size: 38px;
  font-weight: 650;
  line-height: normal;
 }
 .bg-content{
  font-size:14px;
  margin-bottom:24px;
  color: ${obj.page_settings.appearance.text || "rgb(0, 0, 0)"};
  font-size: 21px;
  font-weight: 450;
  line-height: normal;
 }
 .bg-input-wrapper{
  margin-bottom: 18px;
  position:relative;
  cursor:pointer;
 }
 .bg-input-wrapper .bg-input{
  padding:16px 18px;
  height:50px;
  width: 100%;
  background:#F7F7F7;
  border: 1px solid #81868B;
  box-shadow:none;
  box-sizing: border-box;
  -webkit-box-sizing: border-box;
  font-size:18px;
  line-height: normal;
 }
 .bg-input-wrapper::after{
  content: attr(data-copy);
  position: absolute;
  display: flex;
  align-items: center;
  right: 18px;
  top: 0;
  height: 100%;
  font-size: 14px;
  color:#036ADA;
 }
 .bg-input:focus{
  outline: 0;
 }
 .bg-btn{
  border: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  white-space: nowrap;
  border-radius: 4px;
  width: 100%;
  padding: 13px 16px;
  color: rgba(255, 255, 255, 1);
  background: #1B283F;
  line-height:normal;
  font-size:21px;
  cursor:pointer;
 }
 .bg-btn-dark{
  background: ${obj.page_settings.appearance.button.background || "#1B283F"};
  color: ${obj.page_settings.appearance.button.text};
 }

 .bg-close{
  position:absolute;
  top:18px;
  right:21px;
  cursor:pointer;
 }
 .bg-powered-by-container{
  text-align: center;
  margin-bottom: 7px;
}
.bg-powered-by-text{
    color: #ffff;
    padding: 4px 19px;
    font-size: 14px;
    background: rgba(0,0,0,.15);
    font-weight: 600;
    border-radius: 15px;
    text-decoration: none;
}

@-webkit-keyframes bganimatefade {
  from {opacity:0} 
  to {opacity:1}
}

@keyframes bganimatefade {
  from {opacity:0}
  to {opacity:1}
}
.bg-discount-expired{
  color: #81868b;
  text-align: center;
  margin-top:5px;
  font-size:13px;
}
@media (max-width: 600px) {
  .bg-modal-content{
    width: 100%;
    border-radius: 0;
    padding:20px;
  }
  .bg-heading{
    font-size: 30px;
  }
  .bg-content{
    font-size: 18px;
  }
  .bg-btn{
    font-size: 18px;
  }
}
 `;

  bgStyle.type = "text/css";
  if (bgStyle.styleSheet) {
    bgStyle.styleSheet.cssText = css;
  } else {
    bgStyle.appendChild(document.createTextNode(bgCss));
  }
  bgHead.appendChild(bgStyle);
  let bgModalContent = `
${
  !obj.page_settings.appearance.is_hide_brand_bixgrow
    ? `<div class="bg-powered-by-container">
<span class="bg-powered-by-text">Powered by BixGrow</span>
</div>`
    : ""
}
<div class="bg-modal-content">
<svg id="bg-close" class="bg-close" style="width:12px;height:12px" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
<path d="M7.06045 5.99999L11.7803 1.28068C12.0732 0.987705 12.0732 0.512692 11.7803 0.219735C11.4873 -0.0732451 11.0123 -0.0732451 10.7193 0.219735L5.99999 4.93953L1.28068 0.219735C0.987705 -0.0732451 0.512692 -0.0732451 0.219735 0.219735C-0.0732217 0.512716 -0.0732451 0.987728 0.219735 1.28068L4.93953 5.99999L0.219735 10.7193C-0.0732451 11.0123 -0.0732451 11.4873 0.219735 11.7803C0.512716 12.0732 0.987728 12.0732 1.28068 11.7803L5.99999 7.06045L10.7193 11.7803C11.0123 12.0732 11.4873 12.0732 11.7802 11.7803C12.0732 11.4873 12.0732 11.0123 11.7802 10.7193L7.06045 5.99999Z" fill="#1B283F"/>
</svg>
<div id="before-redeem">
<div class="bg-heading">${
    obj.page_settings.content.coupon_display_page.before_redeem_headline
  }</div>
<div class="bg-content">${
    obj.page_settings.content.coupon_display_page.before_redeem_description
  }</div>
<div class="bg-input-wrapper">
<input id="bg-input" class="bg-input" placeholder="${
    obj.page_settings.content.coupon_display_page.before_redeem_your_email
  }">
     <div id="bg-before-redeem-friend-reward-error-text" class="bg-error-message bg-text-left bg-d-none">${
       obj.page_settings.content.coupon_display_page.email_error_message
     }</div>
</div>
${obj.enable_marketing_consent_request == 1 ? `<label class="bg-checkbox">
<input type="checkbox" id="bgMyCheckbox" class="bg-checkbox__input">
<span class="bg-checkbox__label">${obj.marketing_consent_text}</span>
</label>` : ''}

<button type="button"  id="bg-clainm-discount-btn" onclick="handleClaimDiscount()"  class="bg-btn bg-btn-dark" style="display:flex;align-items:center;justify-content:center;">
<span class="bixgrow-button-text">  ${
    obj.page_settings.content.coupon_display_page.before_redeem_button
  }</span>
<span class="bixgrow-spinner"></span>
</button>
</div>

<div id="after-redeem" class="bg-d-none">
<div class="bg-heading">${
    obj.page_settings.content.coupon_display_page.headline
  }</div>
  <div class="bg-content">${
    obj.page_settings.content.coupon_display_page.description
  }</div>
  <div id="bg-input-wrapper" class="bg-input-wrapper" data-copy="${obj.page_settings.content.coupon_display_page.copy}">
  <input id="bg-after-redeem-input" class="bg-input" readonly value="" style="border: 2px dashed #81868B;">
  </div>
  <button type="button" id="bg-btn-shop-now" class="bg-btn bg-btn-dark">${
    obj.page_settings.content.coupon_display_page.button
  }</button>
 
</div>
</div>`;
  referralDiv.insertAdjacentHTML("beforeend", bgModalContent);
  let bgClose = document.getElementById("bg-close");
  bgClose.addEventListener("click", function ($event) {
    referralDiv.style.display = "none";
  });

  let myBtn = document.getElementById("bg-btn-shop-now");
  myBtn.addEventListener("click", function () {
    referralDiv.style.display = "none";
  });
  let bgInputWrapper = document.getElementById("bg-input-wrapper");
  bgInputWrapper.addEventListener("click", function ($event) {
    let bgInput = document.getElementById("bg-after-redeem-input");
    bgInput.select();
    document.execCommand("copy");
    bgInputWrapper.setAttribute("data-copy", obj.page_settings.content.coupon_display_page.copied);
    setTimeout(() => {
      bgInputWrapper.setAttribute("data-copy", obj.page_settings.content.coupon_display_page.copy);
    }, 1500);
  });
  referralDiv.style.display = "block";
}

async function handleClaimDiscount() {
  const advocateId = myDataSetting.advocate_id;
  const emailErrorMessage =
    myDataSetting.page_settings.content.coupon_display_page.email_error_message;
  const referralInvalidMessage =
    myDataSetting.page_settings.content.coupon_display_page.referral_invalid;

  const redeemBtn = document.getElementById("bg-clainm-discount-btn");
  const emailInputElement = document.getElementById("bg-input");
  const emailInput = emailInputElement.value.trim();
  const checkBox = document.getElementById("bgMyCheckbox");
  const checkBoxValue = checkBox ? (checkBox.checked ? 1 : 0) : 0;

  const errorNote = document.getElementById(
    "bg-before-redeem-friend-reward-error-text"
  );

  if (!validateEmail(emailInput)) {
    errorNote.textContent = emailErrorMessage;
    errorNote.classList.remove("bg-d-none");
    emailInputElement.classList.add("bg-border-error");
    return;
  } else {
    errorNote.classList.add("bg-d-none");
    emailInputElement.classList.remove("bg-border-error");
  }

  redeemBtn.classList.add("bg-disabled", "bixgrow-loading");

  const payload = {
    shop: Shopify.shop,
    email: emailInput,
    visitor_id: bgGetCookie("bgrf_visitor_id"),
    advocate_id: advocateId,
    enable_marketing_consent_request: checkBoxValue
  };

  try {
    const responseData = await bgUseFetch(
      `${bixgrowTrackingUrl}/api/referral/friends/discount`,
      "POST",
      payload,
      { "Content-Type": "application/json", Accept: "application/json" }
    );
    if (responseData) {
      myDataSetting.discount = responseData.discount;
      myDataSetting.share_coupon = responseData.share_coupon;
      // createFriendRewardPopup(myDataSetting);
      document.getElementById("bg-after-redeem-input").value =
        responseData.discount.code;
      document.getElementById("before-redeem").classList.add("bg-d-none");
      document.getElementById("after-redeem").classList.remove("bg-d-none");
      errorNote.classList.add("bg-d-none");
      emailInputElement.classList.remove("bg-border-error");
      redeemBtn.classList.remove("bg-disabled", "bixgrow-loading");
      autoAppliedCoupon(responseData.discount.code);
      // redeemBtn.classList.add("bgDisplayNone");
      // redeemBtn.classList.remove('bgDisabled','bixgrow-loading');
      // shopNowBtn.classList.remove("bgDisplayNone");
      // bgInput.innerHTML = responseData?.discount_code;
      // autoAppliedCoupon(responseData?.discount_code);
      // bgInputWrapper.classList.remove("bgDisplayNone");
      // document.getElementById('bgShopNowContent').classList.remove("bgDisplayNone");
      // document.getElementById('bgRedeemContent').classList.add("bgDisplayNone");
      // if(isDynamicCoupon){
      //   bgSetCookie('bixgrow_affiliate_referral', bgRefHashCode, 30);
      // }
    }
  } catch (error) {
    if (error?.status == 422 && error.message == "referral_link_invalid") {
      errorNote.textContent = referralInvalidMessage;
      errorNote.classList.remove("bg-d-none");
      emailInputElement.classList.add("bg-border-error");
      redeemBtn.classList.remove("bg-disabled", "bixgrow-loading");
    }
  }
}

function autoAppliedCoupon(discountCode) {
  // let couponCodePath = encodeURI("/discount/" + discountCode);
  // couponCodePath = couponCodePath.replace("#", "%2523");
  // let iframeBixgrow = document.createElement("iframe");
  // iframeBixgrow.style.cssText = "height: 0; width: 0; display: none;";
  // iframeBixgrow.src = couponCodePath;
  // iframeBixgrow.innerHTML = "Your browser does not support iframes";
  // let app = document.querySelector("body");
  // app.prepend(iframeBixgrow);

  discountCode = encodeURIComponent(discountCode);
  try{
    const url = `https://${shopDomainWidget}/discount/${discountCode}`;
    bgUseFetch(url,'GET');
  }catch(error){
    console.log(error);
  }
}

function bgGetParameterByName(name, url = window.location.href) {
  name = name.replace(/[\[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return "";
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function bgGetDataReferral() {
  let xhttp = new XMLHttpRequest();
  xhttp.open("POST", bixgrowReferralUrl + "/api/referral/info", true);
  xhttp.setRequestHeader("Content-Type", "application/json");
  let data = {
    shop: Shopify.shop,
    type: "widget",
    customer_id: __st.cid,
    url: window.location.href,
  };
  xhttp.send(JSON.stringify(data));
  xhttp.onload = function () {
    let obj = JSON.parse(this.responseText);
    if (Object.keys(obj).length > 0) {
      if (
        bgIsShowWidget(
          obj.page_settings.appearance_v2.launcher.target,
          obj.page_settings.appearance_v2.launcher.target_urls
        )
      ) {
        createWidget(
          obj.page_settings,
          obj.campain_id,
          obj.customer_email,
          obj.customer_name,
          obj.locale,
          obj
        );
      }
    }
  };
}

function createWidget(obj, campainId, customerEmail, customerName, locale, responseData) {
  let head = document.head || document.getElementsByTagName("head")[0];
  let bixgrow_referral_widget_container = document.getElementById(
    "bixgrow_referral_widget_container"
  );
  if (bixgrow_referral_widget_container) {
    bixgrow_referral_widget_container.remove();
  }
  referralDiv = document.createElement("div");
  referralDiv.id = "bixgrow_referral_widget_container";
  document.body.appendChild(referralDiv);
  let style = document.createElement("style");

  let css = "";
  if (obj.appearance_v2.launcher.desktop.type == "float") {
    css += `
    #bixgrow_referral_widget_container{
     position: fixed;
     bottom: ${obj.appearance_v2.launcher.desktop.bottom || 20}px;
     ${
       obj.appearance_v2.launcher.desktop.position == "right" ||
       !obj.appearance_v2.launcher.desktop.position
         ? `right: ${obj.appearance_v2.launcher.desktop.side || 20}px;`
         : `left: ${obj.appearance_v2.launcher.desktop.side || 20}px;`
     } 
     z-index:1101199308121998;
    }
    #bixgrow-refer{
     webkit-animation: .3s linear fadeIn forwards;
       animation: .3s linear fadeIn forwards;
    }
    .bixgrow-refer-banner-image {
     display: inline-block;
     width: 100%;
     height: auto;
     border-top-left-radius: 6px;
     border-top-right-radius: 6px;
   }
   
     .bixgrow-form-group-widget {
     text-align: left !important;
     margin-bottom: 16px;
     }
     .bixgrow-input-icon .bixgrow-form-control-widget {
     padding-left: 38px;
     }
     
     .bixgrow-form-control-widget {
     display: block;
     width: 100%;
     height: 41px;
     padding: 10px 16px;
     font-weight: 400;
     line-height: 1.5;
     color: #616161;
     background-color: #ffffff;
     background-clip: padding-box;
     border: 1px solid #E3E3E3;
     border-radius: 0.42rem;
     -webkit-box-shadow: none;
     box-shadow: none;
     -webkit-transition: border-color 0.15s ease-in-out,
     -webkit-box-shadow 0.15s ease-in-out;
     transition: border-color 0.15s ease-in-out,
     -webkit-box-shadow 0.15s ease-in-out;
     transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
     transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out,
     -webkit-box-shadow 0.15s ease-in-out;
     box-sizing: border-box;
     -webkit-box-sizing: border-box;
     font-size:14px;
     }
   
     
     @media (prefers-reduced-motion: reduce) {
     .bixgrow-form-control-widget {
     transition: none;
     }
     }
     
     .bixgrow-form-control-widget::-ms-expand {
     background-color: transparent;
     border: 0;
     }
     
     .bixgrow-form-control-widget:-moz-focusring {
     color: transparent;
     text-shadow: 0 0 0 #495057;
     }
     .bixgrow-refer-widget-icon__container{
       display:flex;
       align-items:center;
       width:32px;
       height:32px;
       margin-right: ${
         obj.appearance_v2.launcher.desktop.display_method == "icon_only"
           ? "0px"
           : "5px"
       };
     }
     
     .bixgrow-form-control-widget:focus {
     color: #495057;
     background-color: #fff;
     border-color: #80bdff;
     outline: 0;
     box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
     }
     
     .bixgrow-form-control-widget::-webkit-input-placeholder {
     color: #6c757d;
     opacity: 1;
     }
     
     .bixgrow-form-control-widget::-moz-placeholder {
     color: #6c757d;
     opacity: 1;
     }
     
     .bixgrow-form-control-widget:-ms-input-placeholder {
     color: #6c757d;
     opacity: 1;
     }
     
     .bixgrow-form-control-widget::-ms-input-placeholder {
     color: #6c757d;
     opacity: 1;
     }
     
     .bixgrow-form-control-widget::placeholder {
     color: #6c757d;
     opacity: 1;
     }
     
     .bixgrow-input-icon span {
     left: 0;
     top: 0;
     bottom: 0;
     position: absolute;
     display: -webkit-box;
     display: -ms-flexbox;
     display: flex;
     -webkit-box-align: center;
     -ms-flex-align: center;
     align-items: center;
     -webkit-box-pack: center;
     -ms-flex-pack: center;
     justify-content: center;
     width: calc(1.5em + 1.3rem + 2px);
     }
     .bixgrow-btn-widget {
       border: 1px solid ${obj.appearance.button_launcher.stroke};
       user-select: none;
       white-space: nowrap;
       border-radius: ${obj.appearance_v2.button_radius}px;
       width: 100%;
       padding: 10px 20px;
       color: ${obj.appearance.button_launcher.text};
       background: ${obj.appearance.button_launcher.background};
       cursor: pointer;
       font-weight:500;
       font-size:14px;
       height: 41px;
       line-height: normal !important;
       display: flex;
       align-items: center;
       justify-content: center;
     }
     .bixgrow-btn-widget:hover {
       opacity:0.8;
     }
     
    .bixgrow-loading .bixgrow-spinner {
      display: inline-block; 
    }
    .bixgrow-loading .bixgrow-button-text {
      display:none;
    }
     .bixgrow-refer-widget {
     min-width:50px;
     cursor: pointer;
     height: 56px;
     border-radius: 30px;
     box-shadow: 0 0 2px rgb(0 0 0 / 10%), 0 4px 20px rgb(0 0 0 / 14%);
     transition: all 0.3s;
     -webkit-user-select: none;
     -moz-user-select: none;
     -ms-user-select: none;
     user-select: none;
     overflow: hidden;
     background-color: ${obj.appearance_v2.launcher.background};
     -webkit-animation: bixgrowFadeUp .3s;
     animation: bixgrowFadeUp .3s;
     position: absolute;
     ${
       obj.appearance_v2.launcher.desktop.position == "right"
         ? `right: 0px;`
         : `left: 0px;`
     }
       bottom: 0px;
   
     }
   
     .bixgrow-refer-widget-content {
     display: flex;
     justify-content: center;
     align-items: center;
     padding: 16px 19px;
     color: #ffff;
     white-space: nowrap;
    height:100%;
   
     }
     .bixgrow-refer-widget-content span {
       font-size:16px;
       font-weight: 400;
       color:${obj.appearance_v2.launcher.text};
     }
     .bixgrow-refer-widget-close{
       position: absolute;
       top: 0;
       bottom: 0;
       opacity: 0;
       display: flex;
       align-items: center;
       justify-content: center;
       height:100%;
       left: 19px;
     }
     .bixgrow-container{
     width: 100%;
     margin-right: auto;
     margin-left: auto;
     }
     .bixgrow-d-flex{
       display:flex;
     
     }
     .bixgrow-align-items-center{
       align-items: center;
     }
     .bixgrow-justify-content-center{
       justify-content: center;
     }
     .bixgrow-margin-top-10{
       margin-top:10px;
     }
     #bixgrow-close-popup{
       position: absolute;
       right: 15px;
       top: 15px;
       cursor: pointer;
     }
   
     #bixgrow-popup-referral{
       width: 360px;
       position: absolute;
       bottom: 63px;
       ${
         obj.appearance_v2.launcher.desktop.position == "right" ||
         !obj.appearance_v2.launcher.desktop.position
           ? `right: 0px;left:unset;`
           : `left: 0px;right:unset;`
       }
       box-shadow: 0 4px 10px 1px rgb(0 0 0 / 10%);
       background-color: white;
       border-radius:${obj.appearance_v2.card_radius}px;
       overflow:hidden;
     }
   
     .bixgrow-label-name-widget{
       font-size:13px;
       text-align:left;
     }
   
     .bixgrow-refer-content-description-widget{
       font-size: ${obj.appearance_v2.description_text_size}px;
       word-break: break-word;
       margin-bottom: 18px;
       margin-top:0px;
     }
   
     #bixgrow-copy-overlay-widget{
       position: absolute;
       background-color: #000000;
       top: 0px;
       left: 0;
       height: 45px;
       justify-content: center;
       align-items: center;
       width: 100%;
       color: white;
       font-size: 16px;
       display: flex;
     }
     .bixgrow-refer-content-title-widget{
       display: block;
       font-weight: 600;
       font-size: ${obj.appearance_v2.heading_text_size}px;
       color: #000;
       text-align: center;
       margin-bottom: 10px;
       margin-top: 13px;
     }
     .bixgrow-refer-widget{
       border-radius: ${obj.appearance_v2.launcher.button_radius}px;
       }
     .bixgrow-widget-icon {
       width: 100%;
       height: 100%;
     }
     ${
       obj.appearance_v2.launcher.desktop.display_method == "icon_only"
         ? ".bixgrow-refer-widget-content{padding:10px 12px !important;}"
         : ""
     }
     .bixgrow-refer-widget-side{
      z-index: 9999;
       min-width:unset;
       width: 40px;
       height: auto!important;
       border-radius: 8px!important;
       writing-mode: vertical-rl;
       position: fixed;
       ${
         obj.appearance_v2.launcher.desktop.vertical_position == "low"
           ? "bottom:20px;"
           : `${
               obj.appearance_v2.launcher.desktop.vertical_position == "middle"
                 ? "bottom:50%;"
                 : "bottom:unset;top:50px;"
             }`
       } 
       ${
         obj.appearance_v2.launcher.desktop.position == "right"
           ? " border-top-right-radius: 0 !important; border-bottom-right-radius: 0 !important;right:0px;left:unset;"
           : "border-top-left-radius: 0 !important; border-bottom-left-radius: 0 !important;left:0px;right:unset;"
       }
     }
     .bixgrow-refer-widget-side .bixgrow-refer-widget-content {
       padding: 12px 6px;
   }
   .bixgrow-refer-widget-side .bixgrow-refer-widget-icon__container{
     margin-right: 0px;
     margin-bottom: ${
       obj.appearance_v2.launcher.desktop.display_method == "icon_only"
         ? "0px"
         : "5px"
     };
   }
   ${
     obj.appearance_v2.launcher.desktop.type == "side"
       ? `${
           obj.appearance_v2.launcher.desktop.position == "right"
             ? "#bixgrow_referral_widget_container{right: 50%;bottom:60px;}#bixgrow-popup-referral{transform: translateX(50%);bottom:0px;}"
             : "#bixgrow_referral_widget_container{left: 50%;bottom:60px;}#bixgrow-popup-referral{transform: translateX(-50%);bottom:0px;}"
         }`
       : ""
   }
   #bixgrow_referral_widget_container
   #bixgrow-popup-referral{
     -webkit-animation: fadeIn .3s ease;
    animation: fadeIn .3s ease;
    border-radius:6px;
   }
   
     .bixgrow-inactive{
       display:none;
     }
     .bixgrow-active {
       width:56px !important;
       border-radius: 30px !important;
     }
     
     .bixgrow-active .bixgrow-refer-widget-content {
       -webkit-animation: fadeOut .3s ease;
       animation: fadeOut .3s ease;
       -webkit-animation-fill-mode: forwards;
       animation-fill-mode: forwards;
     }
   
     .bixgrow-active .bixgrow-refer-widget-close {
       -webkit-animation: fadeIn .3s ease;
       animation: fadeIn .3s ease;
       -webkit-animation-fill-mode: forwards;
       animation-fill-mode: forwards;
     }
     .bixgrow-border-red{
       border: 1px solid #d72c0d !important;
     }
     .bixgrow-refer-widget-content svg [fill],.bixgrow-refer-widget-close svg [fill]{ fill:${
       obj.appearance_v2.launcher.text
     } !important;}
     
     @-webkit-keyframes fadeIn {
     from {opacity: 0}
     to {opacity: 1}
     }
   
     @keyframes fadeIn {
     from {opacity: 0} 
     to {opacity: 1}
     }
   
     @ - webkit - keyframes fadeOut {
       from {
           opacity: 1
       }
       to {
           opacity: 0
       }
   }
   @keyframes fadeOut {
       from {
         opacity: 1
       }
       to {
         opacity: 0
       }
   }
   @ - webkit - keyframes bixgrowFadeOutNoDisplay {
       from {
           opacity: 1
       }
       to {
           opacity: 0
       }
   }
   @keyframes bixgrowFadeOutNoDisplay {
       from {
           opacity: 1
       }
       to {
           opacity: 0
       }
   }
   @ - webkit - keyframes bixgrowFadeUp {
       from {
           transform: scale(.8)
       }
       to {
           transform: scale(1)
       }
   }
   
   @keyframes bixgrowFadeUp {
       from {
           transform: scale(.8)
       }
       to {
           transform: scale(1)
       }
   }
   
   @ - webkit - keyframes bixgrowfadeSlideIn {
       from{
           bottom:15px
       }
   
       to {
           bottom:20px
       }
   }
   @keyframes bixgrowfadeSlideIn {
     from{
       bottom:15px
   }
   
   to {
       bottom:20px
   }
   }
     
     @media (min-width: 576px) {
       .bixgrow-container {
         max-width: 540px;
       }
     
     }
   
     @media only screen and (max-height: 450px), only screen and (max-width: 450px){
       #bixgrow-popup-referral{
         height: 100%!important;
       left: 0!important;
       max-height: 100vh!important;
       max-width: 100vw!important;
       right: 0!important;
       top: 0!important;
       width: 100%!important;
       position:fixed !important;
       z-index:99999;
       transform: unset!important;
       border-radius: 0px !important;
       }
   
       .bixgrow-refer-banner-image {
         border-top-left-radius: 0px;
         border-top-right-radius: 0px;
       }
       #bixgrow-close-popup-widget-mobile{
         display:block !important;
       }
   
     }
   
     #bixgrow-popup-referral::-webkit-scrollbar {
       display: none;
     }
     
     /* Hide scrollbar for IE, Edge and Firefox */
     #bixgrow-popup-referral {
       -ms-overflow-style: none;  /* IE and Edge */
       scrollbar-width: none;  /* Firefox */
     }
     
     .bixgrow-refer-content-main-widget{
       background: ${obj.appearance.background || "#fff"};
     }
     .bixgrow-refer-content-title-widget,.bixgrow-refer-content-description-widget{
       color: ${obj.appearance.text || "rgb(0, 0, 0)"};
     }
   
     @media (min-width: 768px) {
       .bixgrow-container {
         max-width: 720px;
       }
     }
     
     @media (min-width: 992px) {
       .bixgrow-container {
         max-width: 960px;
       }
     }
     
     @media (min-width: 1200px) {
       .bixgrow-container {
         max-width: 1140px;
       }
     }
     .b-powered-by-container-widget{
       text-align: center;
       margin-top: 10px;
       margin-bottom: 10px;
       position: absolute;
       top: -48px;
       left: 85px;
     }
     .b-powered-by-text-widget{
         color: #ffff;
         padding: 4px 19px;
         font-size: 14px;
         background: rgba(0,0,0,.15);
         font-weight: 600;
         border-radius: 15px;
         text-decoration: none;
     }
     .how-it-works-widget-heading{
       font-size:16px;
       font-weight:600;
     }
     .how-it-works-step-widget{
      padding:5px;
      flex: 1 1 0;
     }
     .how-it-works-step-image-widget{
       display: flex;
       align-items: center;
       justify-content: center;
     }
     .how-it-works-steps-widget{
       display: flex;
       align-items: center;
       justify-content: center;
       flex-direction: column;font-size:13px;
     }
     .how-it-works-step-image-widget,.how-it-works-widget-heading,.bixgrow-refer-content-title-widget,.bixgrow-refer-content-description-widget{
       color: ${obj.appearance.text || "rgb(0, 0, 0)"};
     }
     @media (max-width: 450px){
       #bixgrow-refer-widget-desktop-id{
         display:none;
       }
       #bixgrow-refer-widget-mobile-id{
        display: ${
          obj.appearance_v2.hide_on_mobile ? "none" : "block"
        } !important;
       }
       .bixgrow-refer-widget-icon__container {
         margin-right: ${
           obj.appearance_v2.launcher.mobile.display_method == "icon_only"
             ? "0px"
             : "5px"
         };
       }
       ${
         obj.appearance_v2.launcher.mobile.display_method == "icon_only"
           ? ".bixgrow-refer-widget-content{padding:10px 12px !important;}"
           : ""
       }
       #bixgrow_referral_widget_container{
         position: fixed;
         bottom: ${obj.appearance_v2.launcher.mobile.bottom || 20}px;
         ${
           obj.appearance_v2.launcher.mobile.position == "right" ||
           !obj.appearance_v2.launcher.mobile.position
             ? `right: ${
                 obj.appearance_v2.launcher.mobile.side || 20
               }px;left:unset;`
             : `left: ${
                 obj.appearance_v2.launcher.mobile.side || 20
               }px;right:unset;`
         } 
         z-index:1101199308121998;
        }
        .bixgrow-refer-widget {
         ${
           obj.appearance_v2.launcher.mobile.position == "right"
             ? `right: 0px;left:unset;`
             : `left: 0px;right:unset`
         }
         }
         #bixgrow-popup-referral{
           ${
             obj.appearance_v2.launcher.mobile.position == "right" ||
             !obj.appearance_v2.launcher.mobile.position
               ? `right: 0px;left: unset;`
               : `left: 0px;right:unset;`
           }
         }
         .bixgrow-refer-widget-side{
          z-index: 9999;
           min-width:unset;
           width: 40px;
           height: auto!important;
           border-radius: 8px!important;
           writing-mode: vertical-rl;
           position: fixed;
           ${
             obj.appearance_v2.launcher.mobile.vertical_position == "low"
               ? "bottom:20px;"
               : `${
                   obj.appearance_v2.launcher.mobile.vertical_position ==
                   "middle"
                     ? "bottom:50%;"
                     : "bottom:unset;top:50px;"
                 }`
           } 
           ${
             obj.appearance_v2.launcher.mobile.position == "right"
               ? " border-top-right-radius: 0 !important; border-bottom-right-radius: 0 !important;right:0px"
               : "border-top-left-radius: 0 !important; border-bottom-left-radius: 0 !important;left:0px;"
           }
         }
         .bixgrow-refer-widget-side .bixgrow-refer-widget-content {
           padding: 12px 6px;
       }
       .bixgrow-refer-widget-side .bixgrow-refer-widget-icon__container{
         margin-right: 0px;
         margin-bottom: ${
           obj.appearance_v2.launcher.mobile.display_method == "icon_only"
             ? "0px"
             : "5px"
         };
       }
       ${
         obj.appearance_v2.launcher.desktop.type == "side"
           ? `${
               obj.appearance_v2.launcher.desktop.position == "right"
                 ? "#bixgrow_referral_widget_container{right: 50%;bottom:60px;}#bixgrow-popup-referral{transform: translateX(50%);bottom:0px;}"
                 : "#bixgrow_referral_widget_container{left: 50%;bottom:60px;}#bixgrow-popup-referral{transform: translateX(-50%);bottom:0px;}"
             }`
           : ""
       }
     }
     .how-it-works-step-image-widget svg [fill]{fill:${
       obj.appearance.text || "rgb(0, 0, 0)"
     } !important;}
     ${obj.appearance.custom_css ? obj.appearance.custom_css : ""}`;
  } else {
    css += `
    #bixgrow_referral_widget_container{
      left: 0;
      top: 0;
      overflow:auto;
      z-index:1101199308121998;
      width:100%;
      height:100%;
     }
    #bixgrow-refer{
     webkit-animation: .3s linear fadeIn forwards;
       animation: .3s linear fadeIn forwards;
    }
    .bixgrow-refer-banner-image {
     display: inline-block;
     width: 100%;
     height: auto;
     border-top-left-radius: 6px;
     border-top-right-radius: 6px;
   }
   
   .bixgrow-wrapper-active{
    position: fixed;
    padding-top:100px;
    background-color:rgb(0,0,0,0.25);
   }

     .bixgrow-form-group-widget {
     text-align: left !important;
     margin-bottom: 16px;
     }
     .bixgrow-input-icon .bixgrow-form-control-widget {
     padding-left: 38px;
     }
     
     .bixgrow-form-control-widget {
     display: block;
     width: 100%;
     height: 41px;
     padding: 10px 16px;
     font-weight: 400;
     line-height: 1.5;
     color: #616161;
     background-color: #ffffff;
     background-clip: padding-box;
     border: 1px solid #E3E3E3;
     border-radius: 0.42rem;
     -webkit-box-shadow: none;
     box-shadow: none;
     -webkit-transition: border-color 0.15s ease-in-out,
     -webkit-box-shadow 0.15s ease-in-out;
     transition: border-color 0.15s ease-in-out,
     -webkit-box-shadow 0.15s ease-in-out;
     transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
     transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out,
     -webkit-box-shadow 0.15s ease-in-out;
     box-sizing: border-box;
     -webkit-box-sizing: border-box;
     font-size:14px;
     }
   
     
     @media (prefers-reduced-motion: reduce) {
     .bixgrow-form-control-widget {
     transition: none;
     }
     }
     
     .bixgrow-form-control-widget::-ms-expand {
     background-color: transparent;
     border: 0;
     }
     
     .bixgrow-form-control-widget:-moz-focusring {
     color: transparent;
     text-shadow: 0 0 0 #495057;
     }
     .bixgrow-refer-widget-icon__container{
       display:flex;
       align-items:center;
       width:32px;
       height:32px;
       margin-right: ${
         obj.appearance_v2.launcher.desktop.display_method == "icon_only"
           ? "0px"
           : "5px"
       };
     }
     
     .bixgrow-form-control-widget:focus {
     color: #495057;
     background-color: #fff;
     border-color: #80bdff;
     outline: 0;
     box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
     }
     
     .bixgrow-form-control-widget::-webkit-input-placeholder {
     color: #6c757d;
     opacity: 1;
     }
     
     .bixgrow-form-control-widget::-moz-placeholder {
     color: #6c757d;
     opacity: 1;
     }
     
     .bixgrow-form-control-widget:-ms-input-placeholder {
     color: #6c757d;
     opacity: 1;
     }
     
     .bixgrow-form-control-widget::-ms-input-placeholder {
     color: #6c757d;
     opacity: 1;
     }
     
     .bixgrow-form-control-widget::placeholder {
     color: #6c757d;
     opacity: 1;
     }
     
     .bixgrow-input-icon span {
     left: 0;
     top: 0;
     bottom: 0;
     position: absolute;
     display: -webkit-box;
     display: -ms-flexbox;
     display: flex;
     -webkit-box-align: center;
     -ms-flex-align: center;
     align-items: center;
     -webkit-box-pack: center;
     -ms-flex-pack: center;
     justify-content: center;
     width: calc(1.5em + 1.3rem + 2px);
     }
     .bixgrow-btn-widget {
       border: 1px solid ${obj.appearance.button_launcher.stroke};
       user-select: none;
       white-space: nowrap;
       border-radius: ${obj.appearance_v2.button_radius}px;
       width: 100%;
       padding: 10px 20px;
       color: ${obj.appearance.button_launcher.text};
       background: ${obj.appearance.button_launcher.background};
       cursor: pointer;
       font-weight:500;
       font-size:14px;
       height: 41px;
       line-height: normal !important;
     }
     .bixgrow-btn-widget:hover {
       opacity:0.8;
     }
     .bixgrow-refer-widget {
     min-width:50px;
     cursor: pointer;
     height: 56px;
     border-radius: 30px;
     box-shadow: 0 0 2px rgb(0 0 0 / 10%), 0 4px 20px rgb(0 0 0 / 14%);
     transition: all 0.3s;
     -webkit-user-select: none;
     -moz-user-select: none;
     -ms-user-select: none;
     user-select: none;
     overflow: hidden;
     background-color: ${obj.appearance_v2.launcher.background};
     -webkit-animation: ${
       obj.appearance_v2.launcher.desktop.position == "right"
         ? "rightIn"
         : "leftIn"
     } .3s;
     animation: ${
       obj.appearance_v2.launcher.desktop.position == "right"
         ? "rightIn"
         : "leftIn"
     } .3s;
     position: absolute;
     ${
       obj.appearance_v2.launcher.desktop.position == "right"
         ? `right: 0px;`
         : `left: 0px;`
     }
       bottom: 0px;
   
     }
   
     .bixgrow-refer-widget-content {
     display: flex;
     justify-content: center;
     align-items: center;
     height: 100%;
     padding: 16px 19px;
     color: #ffff;
     white-space: nowrap;
   
   
     }
     .bixgrow-refer-widget-content span {
       font-size:16px;
       font-weight: 400;
       color:${obj.appearance_v2.launcher.text};
     }
     .bixgrow-refer-widget-close{
       position: absolute;
       top: 0;
       bottom: 0;
       opacity: 0;
       display: flex;
       align-items: center;
       justify-content: center;
       height:100%;
       left: 19px;
     }
     .bixgrow-container{
     width: 100%;
     margin-right: auto;
     margin-left: auto;
     }
     .bixgrow-d-flex{
       display:flex;
     
     }
     .bixgrow-align-items-center{
       align-items: center;
     }
     .bixgrow-justify-content-center{
       justify-content: center;
     }
     .bixgrow-margin-top-10{
       margin-top:10px;
     }
     #bixgrow-close-popup{
       position: absolute;
       right: 15px;
       top: 15px;
       cursor: pointer;
     }
   
     #bixgrow-popup-referral{
      width: 360px;
      margin: auto;
      box-shadow: 0 4px 10px 1px rgb(0 0 0 / 10%);
      background-color: white;
      border-radius:${obj.appearance_v2.card_radius}px;
      overflow:hidden;
     }
   
     .bixgrow-label-name-widget{
       font-size:13px;
       text-align:left;
     }
   
     .bixgrow-refer-content-description-widget{
       font-size: ${obj.appearance_v2.description_text_size}px;
       word-break: break-word;
       margin-bottom: 18px;
       margin-top:0px;
     }
   
     #bixgrow-copy-overlay-widget{
       position: absolute;
       background-color: #000000;
       top: 0px;
       left: 0;
       height: calc(1.5em + 1.3rem);
       justify-content: center;
       align-items: center;
       width: 100%;
       color: white;
       font-size: 16px;
     }
     .bixgrow-refer-content-title-widget{
       display: block;
       font-weight: 600;
       font-size: ${obj.appearance_v2.heading_text_size}px;
       color: #000;
       text-align: center;
       margin-bottom: 10px;
       margin-top: 13px;
     }
     .bixgrow-refer-widget{
       border-radius: ${obj.appearance_v2.launcher.button_radius}px;
       }
     .bixgrow-widget-icon {
       width: 100%;
       height: 100%;
     }
     ${
       obj.appearance_v2.launcher.desktop.display_method == "icon_only"
         ? ".bixgrow-refer-widget-content{padding:10px 12px !important;}"
         : ""
     }
     .bixgrow-refer-widget-side{
      z-index: 9999;
       min-width:unset;
       width: 40px;
       height: auto!important;
       border-radius: 8px!important;
       writing-mode: vertical-rl;
       position: fixed;
       ${
         obj.appearance_v2.launcher.desktop.vertical_position == "low"
           ? "bottom:20px;"
           : `${
               obj.appearance_v2.launcher.desktop.vertical_position == "middle"
                 ? "bottom:50%;"
                 : "bottom:unset;top:50px;"
             }`
       } 
       ${
         obj.appearance_v2.launcher.desktop.position == "right"
           ? " border-top-right-radius: 0 !important; border-bottom-right-radius: 0 !important;right:0px;left:unset;"
           : "border-top-left-radius: 0 !important; border-bottom-left-radius: 0 !important;left:0px;right:unset;"
       }
     }
     .bixgrow-refer-widget-side .bixgrow-refer-widget-content {
       padding: 12px 6px;
   }
   .bixgrow-refer-widget-side .bixgrow-refer-widget-icon__container{
     width:24px;
     height: 24px;
     margin-right: 0px;
     margin-bottom: ${
       obj.appearance_v2.launcher.desktop.display_method == "icon_only"
         ? "0px"
         : "5px"
     };
   }
   #bixgrow_referral_widget_container
   #bixgrow-popup-referral{
     -webkit-animation: fadeIn .3s ease;
    animation: fadeIn .3s ease;
    border-radius:6px;
   }

   .bixgrow-side-active{
    -webkit-animation: ${
      obj.appearance_v2.launcher.desktop.position == "right"
        ? "rightOut"
        : "leftOut"
    } .3s;
    animation: ${
      obj.appearance_v2.launcher.desktop.position == "right"
        ? "rightOut"
        : "leftOut"
    } .3s;
    ${
      obj.appearance_v2.launcher.desktop.position == "right"
        ? "right:-56px;"
        : "left:-56px;"
    };
   }
   
     .bixgrow-inactive{
       display:none;
     }
     .bixgrow-active {
       width:56px !important;
       border-radius: 30px !important;
     }
     
     .bixgrow-active .bixgrow-refer-widget-content {
       -webkit-animation: fadeOut .3s ease;
       animation: fadeOut .3s ease;
       -webkit-animation-fill-mode: forwards;
       animation-fill-mode: forwards;
     }
   
     .bixgrow-active .bixgrow-refer-widget-close {
       -webkit-animation: fadeIn .3s ease;
       animation: fadeIn .3s ease;
       -webkit-animation-fill-mode: forwards;
       animation-fill-mode: forwards;
     }
     .bixgrow-border-red{
       border: 1px solid #d72c0d !important;
     }
     .bixgrow-refer-widget-content svg [fill],.bixgrow-refer-widget-close svg [fill]{ fill:${
       obj.appearance_v2.launcher.text
     } !important;}
     
     @-webkit-keyframes rightOut {
      0% {right: 0;}
      100% {right: -56px}
     }
   
     @keyframes rightOut {
      0% {right: 0;}
      100% {right: -56px}
     }
     @-webkit-keyframes rightIn {
      0% {right: -56px}
      100% {right: 0}
     }
   
     @keyframes rightIn {
      0% {right: -56px}
      100% {right: 0 }
     }

     @-webkit-keyframes leftOut {
      0% {left: 0;}
      100% {left: -56px}
     }
   
     @keyframes leftOut {
      0% {left: 0;}
      100% {left: -56px}
     }
     @-webkit-keyframes leftIn {
      0% {left: -56px}
      100% {left: 0}
     }
   
     @keyframes leftIn {
      0% {left: -56px}
      100% {left: 0 }
     }

     @-webkit-keyframes fadeIn {
     from {opacity: 0}
     to {opacity: 1}
     }
   
     @keyframes fadeIn {
     from {opacity: 0} 
     to {opacity: 1}
     }
   
     @ - webkit - keyframes fadeOut {
       from {
           opacity: 1
       }
       to {
           opacity: 0
       }
   }
   @keyframes fadeOut {
       from {
         opacity: 1
       }
       to {
         opacity: 0
       }
   }
   @ - webkit - keyframes bixgrowFadeOutNoDisplay {
       from {
           opacity: 1
       }
       to {
           opacity: 0
       }
   }
   @keyframes bixgrowFadeOutNoDisplay {
       from {
           opacity: 1
       }
       to {
           opacity: 0
       }
   }
   @ - webkit - keyframes bixgrowFadeUp {
       from {
           transform: scale(.8)
       }
       to {
           transform: scale(1)
       }
   }
   
   @keyframes bixgrowFadeUp {
       from {
           transform: scale(.8)
       }
       to {
           transform: scale(1)
       }
   }
   
   @ - webkit - keyframes bixgrowfadeSlideIn {
       from{
           bottom:15px
       }
   
       to {
           bottom:20px
       }
   }
   @keyframes bixgrowfadeSlideIn {
     from{
       bottom:15px
   }
   
   to {
       bottom:20px
   }
   }
     
     @media (min-width: 576px) {
       .bixgrow-container {
         max-width: 540px;
       }
     
     }
   
     @media only screen and (max-height: 450px), only screen and (max-width: 450px){
       #bixgrow-popup-referral{
         height: 100%!important;
       left: 0!important;
       max-height: 100vh!important;
       max-width: 100vw!important;
       right: 0!important;
       top: 0!important;
       width: 100%!important;
       position:fixed !important;
       z-index:99999;
       transform: unset!important;
       border-radius: 0px !important;
       }
   
       .bixgrow-refer-banner-image {
         border-top-left-radius: 0px;
         border-top-right-radius: 0px;
       }
       #bixgrow-close-popup-widget-mobile{
         display:block !important;
       }
   
     }
   
     #bixgrow-popup-referral::-webkit-scrollbar {
       display: none;
     }
     
     /* Hide scrollbar for IE, Edge and Firefox */
     #bixgrow-popup-referral {
       -ms-overflow-style: none;  /* IE and Edge */
       scrollbar-width: none;  /* Firefox */
     }
     
     .bixgrow-refer-content-main-widget{
       background: ${obj.appearance.background || "#fff"};
     }
     .bixgrow-refer-content-title-widget,.bixgrow-refer-content-description-widget{
       color: ${obj.appearance.text || "rgb(0, 0, 0)"};
     }
   
     @media (min-width: 768px) {
       .bixgrow-container {
         max-width: 720px;
       }
     }
     
     @media (min-width: 992px) {
       .bixgrow-container {
         max-width: 960px;
       }
     }
     
     @media (min-width: 1200px) {
       .bixgrow-container {
         max-width: 1140px;
       }
     }
     .b-powered-by-container-widget{
       text-align: center;
       margin-top: 10px;
       margin-bottom: 10px;
       position: absolute;
       top: -48px;
       left: 85px;
     }
     .b-powered-by-text-widget{
         color: #ffff;
         padding: 4px 19px;
         font-size: 14px;
         background: rgba(0,0,0,.15);
         font-weight: 600;
         border-radius: 15px;
         text-decoration: none;
     }
     .how-it-works-widget-heading{
       font-size:16px;
       font-weight:600;
     }
     .how-it-works-step-widget{
      padding:5px;
      flex: 1 1 0;
     }
     .how-it-works-step-image-widget{
       display: flex;
       align-items: center;
       justify-content: center;
     }
     .how-it-works-steps-widget{
       display: flex;
       align-items: center;
       justify-content: center;
       flex-direction: column;font-size:13px;
     }
     .how-it-works-step-image-widget,.how-it-works-widget-heading,.bixgrow-refer-content-title-widget,.bixgrow-refer-content-description-widget{
       color: ${obj.appearance.text || "rgb(0, 0, 0)"};
     }
     #bixgrow-popup-referral{
      position:relative;
     }
     #bixgrow-close-popup-widget-desktop{
      display:block !important;
     }
     @media (max-width: 450px){
       #bixgrow-refer-widget-desktop-id{
         display:none;
       }
       #bixgrow-close-popup-widget-desktop{
        display: none !important;
       }
       .bixgrow-wrapper-active{
        padding-top:unset !important;
        background-color:unset !important;
       }
       #bixgrow-refer-widget-mobile-id{
        display: ${
          obj.appearance_v2.hide_on_mobile ? "none" : "block"
        } !important;
       }
       .bixgrow-refer-widget-icon__container {
         margin-right: ${
           obj.appearance_v2.launcher.mobile.display_method == "icon_only"
             ? "0px"
             : "5px"
         };
       }
       ${
         obj.appearance_v2.launcher.mobile.display_method == "icon_only"
           ? ".bixgrow-refer-widget-content{padding:10px 12px !important;}"
           : ""
       }
       #bixgrow_referral_widget_container{
         position: fixed;
         bottom: ${obj.appearance_v2.launcher.mobile.bottom || 20}px;
         ${
           obj.appearance_v2.launcher.mobile.position == "right" ||
           !obj.appearance_v2.launcher.mobile.position
             ? `right: ${
                 obj.appearance_v2.launcher.mobile.side || 20
               }px;left:unset;`
             : `left: ${
                 obj.appearance_v2.launcher.mobile.side || 20
               }px;right:unset;`
         } 
         z-index:1101199308121998;  
         top: unset;
         padding-top: 0;
         background-color: unset;
         overflow: unset;
         width: 0;
         height: 0;
        }
        .bixgrow-refer-widget {
         ${
           obj.appearance_v2.launcher.mobile.position == "right"
             ? `right: 0px;left:unset;`
             : `left: 0px;right:unset`
         }
         }
         #bixgrow-popup-referral{
           ${
             obj.appearance_v2.launcher.mobile.position == "right" ||
             !obj.appearance_v2.launcher.mobile.position
               ? `right: 0px;left: unset;`
               : `left: 0px;right:unset;`
           }
         }
         .bixgrow-refer-widget-side{
          z-index: 9999;
           min-width:unset;
           width: 40px;
           height: auto!important;
           border-radius: 8px!important;
           writing-mode: vertical-rl;
           position: fixed;
           ${
             obj.appearance_v2.launcher.mobile.vertical_position == "low"
               ? "bottom:20px;"
               : `${
                   obj.appearance_v2.launcher.mobile.vertical_position ==
                   "middle"
                     ? "bottom:50%;"
                     : "bottom:unset;top:50px;"
                 }`
           } 
           ${
             obj.appearance_v2.launcher.mobile.position == "right"
               ? " border-top-right-radius: 0 !important; border-bottom-right-radius: 0 !important;right:0px"
               : "border-top-left-radius: 0 !important; border-bottom-left-radius: 0 !important;left:0px;"
           }
         }
         .bixgrow-refer-widget-side .bixgrow-refer-widget-content {
           padding: 12px 6px;
       }
       .bixgrow-refer-widget-side .bixgrow-refer-widget-icon__container{
         margin-right: 0px;
         margin-bottom: ${
           obj.appearance_v2.launcher.mobile.display_method == "icon_only"
             ? "0px"
             : "5px"
         };
       }
     }
     .how-it-works-step-image-widget svg [fill]{fill:${
       obj.appearance.text || "rgb(0, 0, 0)"
     } !important;}
     ${obj.appearance.custom_css ? obj.appearance.custom_css : ""}`;
  }

  style.type = "text/css";
  if (style.styleSheet) {
    // This is required for IE8 and below.
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }
  head.appendChild(style);
  let divContent = `
 <div id="bixgrow-popup-referral" class="bixgrow-inactive">
 ${
   !obj.appearance.is_hide_brand_bixgrow
     ? ` <div id="b-powered-by-widget-id" class="b-powered-by-container-widget bixgrow-inactive">
 <span class="b-powered-by-text-widget">Powered by BixGrow</span>
 </div>`
     : ""
 }
 <span style=" position: absolute;top: 10px;right: 14px;cursor: pointer;display:none;" id="bixgrow-close-popup-widget-mobile"><svg style="width:30px;height:30px;" xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 16 16" fill="none">
 <circle cx="8" cy="8" r="8" fill="#81868B" fill-opacity="1"/>
 <path d="M10.7951 5.2049C10.6639 5.0737 10.4859 5 10.3003 5C10.1147 5 9.93678 5.0737 9.80554 5.2049L7.99577 7.01466L6.18601 5.2049C6.05402 5.07742 5.87724 5.00688 5.69375 5.00848C5.51026 5.01007 5.33473 5.08367 5.20498 5.21343C5.07522 5.34318 5.00162 5.51871 5.00003 5.7022C4.99843 5.88569 5.06897 6.06247 5.19645 6.19446L7.00621 8.00422L5.19645 9.81399C5.06897 9.94598 4.99843 10.1228 5.00003 10.3062C5.00162 10.4897 5.07522 10.6653 5.20498 10.795C5.33473 10.9248 5.51026 10.9984 5.69375 11C5.87724 11.0016 6.05402 10.931 6.18601 10.8035L7.99577 8.99379L9.80554 10.8035C9.93753 10.931 10.1143 11.0016 10.2978 11C10.4813 10.9984 10.6568 10.9248 10.7866 10.795C10.9163 10.6653 10.9899 10.4897 10.9915 10.3062C10.9931 10.1228 10.9226 9.94598 10.7951 9.81399L8.98534 8.00422L10.7951 6.19446C10.9263 6.06322 11 5.88525 11 5.69968C11 5.51411 10.9263 5.33614 10.7951 5.2049Z" fill="white"/>
 </svg></span>
 ${
   obj.appearance_v2.launcher.desktop.type == "side"
     ? `<span style=" position: absolute;top: 10px;right: 14px;cursor: pointer;display:none;" id="bixgrow-close-popup-widget-desktop"><svg style="width:30px;height:30px;" xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 16 16" fill="none">
 <circle cx="8" cy="8" r="8" fill="#81868B" fill-opacity="1"/>
 <path d="M10.7951 5.2049C10.6639 5.0737 10.4859 5 10.3003 5C10.1147 5 9.93678 5.0737 9.80554 5.2049L7.99577 7.01466L6.18601 5.2049C6.05402 5.07742 5.87724 5.00688 5.69375 5.00848C5.51026 5.01007 5.33473 5.08367 5.20498 5.21343C5.07522 5.34318 5.00162 5.51871 5.00003 5.7022C4.99843 5.88569 5.06897 6.06247 5.19645 6.19446L7.00621 8.00422L5.19645 9.81399C5.06897 9.94598 4.99843 10.1228 5.00003 10.3062C5.00162 10.4897 5.07522 10.6653 5.20498 10.795C5.33473 10.9248 5.51026 10.9984 5.69375 11C5.87724 11.0016 6.05402 10.931 6.18601 10.8035L7.99577 8.99379L9.80554 10.8035C9.93753 10.931 10.1143 11.0016 10.2978 11C10.4813 10.9984 10.6568 10.9248 10.7866 10.795C10.9163 10.6653 10.9899 10.4897 10.9915 10.3062C10.9931 10.1228 10.9226 9.94598 10.7951 9.81399L8.98534 8.00422L10.7951 6.19446C10.9263 6.06322 11 5.88525 11 5.69968C11 5.51411 10.9263 5.33614 10.7951 5.2049Z" fill="white"/>
 </svg></span>`
     : ""
 }
 
     ${
       !obj.appearance.is_hide_image
         ? `<div class="bixgrow-refer-widget-banner" style="line-height: 0;">
     <img src="${obj.appearance.banner}" class="bixgrow-refer-banner-image">
 </div>`
         : ""
     } 
     <div
       class="bixgrow-refer-content-main-widget"
       style="text-align: center"
     >
       <div id="bixgrow-refer-content-main-widget__container" style="width: 85%; display: inline-block;max-width:320px;margin-bottom:28px">

         
         <div id="bixgrow_refer_content_input_invite_widget" class="bixgrow-refer-content-input">
         <div
         class="bixgrow-refer-content-title-widget"
       >
       ${obj.content.join_page.headline || ""}
       </div>
         <p
           class="bixgrow-refer-content-description-widget"
         >
         ${obj.content.join_page.description || ""}
         </p>
           <div class="bixgrow-form-group-widget" >
             <div
               class="bixgrow-input-icon"
               style="position: relative"
             >
               <input
                 type="text"
                 class="bixgrow-form-control-widget"
                 name="email"
                 required
                 placeholder="${
                   obj.content.join_page.your_email
                     ? obj.content.join_page.your_email
                     : "Your email"
                 }"
                 id="bixgrow-email-advocate-widget"
               />
               <span>
                 <svg style="width:18px;height:18px;"
                   xmlns="http://www.w3.org/2000/svg"
                   width="18"
                   height="18"
                   viewBox="0 0 20 20"
                   fill="none"
                 >
                   <path
                     d="M15.8333 0.833344H4.16667C3.062 0.834667 2.00296 1.27408 1.22185 2.05519C0.440735 2.83631 0.00132321 3.89535 0 5.00001L0 15C0.00132321 16.1047 0.440735 17.1637 1.22185 17.9448C2.00296 18.7259 3.062 19.1654 4.16667 19.1667H15.8333C16.938 19.1654 17.997 18.7259 18.7782 17.9448C19.5593 17.1637 19.9987 16.1047 20 15V5.00001C19.9987 3.89535 19.5593 2.83631 18.7782 2.05519C17.997 1.27408 16.938 0.834667 15.8333 0.833344ZM4.16667 2.50001H15.8333C16.3323 2.50099 16.8196 2.65127 17.2325 2.93151C17.6453 3.21175 17.9649 3.60913 18.15 4.07251L11.7683 10.455C11.2987 10.9228 10.6628 11.1854 10 11.1854C9.33715 11.1854 8.70131 10.9228 8.23167 10.455L1.85 4.07251C2.03512 3.60913 2.35468 3.21175 2.76754 2.93151C3.1804 2.65127 3.66768 2.50099 4.16667 2.50001ZM15.8333 17.5H4.16667C3.50363 17.5 2.86774 17.2366 2.3989 16.7678C1.93006 16.2989 1.66667 15.6631 1.66667 15V6.25001L7.05333 11.6333C7.83552 12.4136 8.89521 12.8517 10 12.8517C11.1048 12.8517 12.1645 12.4136 12.9467 11.6333L18.3333 6.25001V15C18.3333 15.6631 18.0699 16.2989 17.6011 16.7678C17.1323 17.2366 16.4964 17.5 15.8333 17.5Z"
                     fill="#8e959b"
                   />
                 </svg>
               </span>
             </div>
             <div id="note-bixgrow-email-advocate-widget" style="display:none;color:#d72c0d;font-size:12px;"></div>
           </div>
           <div class="bixgrow-form-group-widget" >
         
             <div
               class="bixgrow-input-icon"
               style="position: relative"
             >
               <input
                 type="text"
                 class="bixgrow-form-control-widget"
                 placeholder="${
                   obj.content.join_page.your_name
                     ? obj.content.join_page.your_name
                     : "Your name (optional)"
                 }"
                 id="bixgrow-name-advocate-widget"
               />
               <span>
                 <svg style="width:18px;height:18px;"
                   xmlns="http://www.w3.org/2000/svg"
                   width="18"
                   height="18"
                   viewBox="0 0 20 20"
                   fill="none"
                 >
                   <g
                     clip-path="url(#clip0_4082_2860)"
                   >
                     <path
                       d="M17.5 20H15.8333V15.7975C15.8327 15.1442 15.5728 14.5178 15.1109 14.0558C14.6489 13.5938 14.0225 13.334 13.3692 13.3333H6.63083C5.9775 13.334 5.35111 13.5938 4.88914 14.0558C4.42716 14.5178 4.16733 15.1442 4.16667 15.7975V20H2.5V15.7975C2.50132 14.7023 2.93696 13.6524 3.71135 12.878C4.48575 12.1036 5.53567 11.668 6.63083 11.6667H13.3692C14.4643 11.668 15.5143 12.1036 16.2886 12.878C17.063 13.6524 17.4987 14.7023 17.5 15.7975V20Z"
                       fill="#8e959b"
                     />
                     <path
                       d="M10 10C9.0111 10 8.0444 9.70676 7.22215 9.15735C6.39991 8.60794 5.75904 7.82705 5.3806 6.91342C5.00217 5.99979 4.90315 4.99446 5.09608 4.02455C5.289 3.05465 5.76521 2.16373 6.46447 1.46447C7.16373 0.765206 8.05465 0.289002 9.02455 0.0960758C9.99446 -0.0968503 10.9998 0.00216643 11.9134 0.380605C12.8271 0.759043 13.6079 1.39991 14.1574 2.22215C14.7068 3.0444 15 4.0111 15 5C14.9987 6.32568 14.4715 7.59668 13.5341 8.53407C12.5967 9.47147 11.3257 9.99868 10 10ZM10 1.66667C9.34073 1.66667 8.69627 1.86217 8.1481 2.22844C7.59994 2.59471 7.1727 3.1153 6.9204 3.72439C6.66811 4.33348 6.6021 5.0037 6.73072 5.6503C6.85934 6.29691 7.1768 6.89085 7.64298 7.35703C8.10915 7.8232 8.7031 8.14067 9.3497 8.26929C9.9963 8.3979 10.6665 8.33189 11.2756 8.0796C11.8847 7.82731 12.4053 7.40007 12.7716 6.8519C13.1378 6.30374 13.3333 5.65927 13.3333 5C13.3333 4.11595 12.9821 3.2681 12.357 2.64298C11.7319 2.01786 10.8841 1.66667 10 1.66667Z"
                       fill="#8e959b"
                     />
                   </g>
                   <defs>
                     <clipPath id="clip0_4082_2860">
                       <rect
                         width="20"
                         height="20"
                         fill="white"
                       />
                     </clipPath>
                   </defs>
                 </svg>
               </span>
             </div>
           </div>
           ${responseData.enable_marketing_consent_request == 1 ? `<label class="bg-checkbox bg-checkbox--small">
<input type="checkbox" id="bgWidgetMyCheckbox" class="bg-checkbox__input">
<span class="bg-checkbox__label">${responseData.marketing_consent_text}</span>
</label>` : ''}
           <button type="submit" id="bixgrow_btn_invite_widget" class="w-100 bixgrow-btn-widget">
           <span class="bixgrow-button-text">  ${
             obj.content.join_page.button || ""
           }</span>
          <span class="bixgrow-spinner"></span>
           </button>
         </div>
         <div id="bixgrow_refer_content_input_share_widget" style='display:none' class="bixgrow-refer-content-input">
         <div
         class="bixgrow-refer-content-title-widget"
       >
       ${obj.content.share_page.headline || ""}
       </div>
       <p
       class="bixgrow-refer-content-description-widget"
     >
     ${obj.content.share_page.description || ""}
     </p>
         <div class="bixgrow-form-group-widget">
           <input
              id="bixgrow-referral-link-text-copy-widget"
             type="text"
             readonly
             class="bixgrow-form-control-widget"
             value="https://mytestdrive.bixgrow.com/register"
           />
         </div>
        <div class='bixgrow-copy-main' style="position:relative;margin-top: 15px;">
         <button type="button" id="bixgrow_btn_copy_widget" class="bixgrow-btn-widget">
         ${obj.content.share_page.button || ""}
         </button>
         <div id="bixgrow-copy-overlay-widget" style="display:none"> ${
           obj.content.share_page.copied || "Copied"
         }</div>
         </div>
         <div id="bixgrow_how_it_works_widget"
         style="
         padding-top: 4px;
         padding-bottom: 10px; display:none
         "            
       >
      <div class="how-it-works-widget-heading"  >${
        obj.how_it_works.share_page.content.how_it_works || ""
      }</div>
      <div class="how-it-works-steps-widget">
       <div class="how-it-works-step-widget">
       <div class="how-it-works-step-image-widget" > 
       <svg style="margin-right: 8px;width:16px;" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 16 14" fill="none">
      <path d="M0 13.3328V8.66619C0.00176457 7.07543 0.634472 5.55034 1.75931 4.4255C2.88414 3.30067 4.40924 2.66796 6 2.6662H9.22V1.60887C9.22006 1.3452 9.29829 1.08747 9.4448 0.868255C9.59131 0.649042 9.79953 0.47819 10.0431 0.377296C10.2867 0.276403 10.5548 0.249999 10.8134 0.301423C11.072 0.352846 11.3095 0.479788 11.496 0.6662L15.416 4.58553C15.7909 4.96058 16.0016 5.4692 16.0016 5.99953C16.0016 6.52985 15.7909 7.03847 15.416 7.41352L11.496 11.3329C11.3095 11.5193 11.072 11.6462 10.8134 11.6976C10.5548 11.7491 10.2867 11.7226 10.0431 11.6218C9.79953 11.5209 9.59131 11.35 9.4448 11.1308C9.29829 10.9116 9.22006 10.6539 9.22 10.3902V9.33285H5.33333C4.27279 9.33391 3.25599 9.75568 2.50608 10.5056C1.75616 11.2555 1.33439 12.2723 1.33333 13.3328C1.33333 13.5097 1.2631 13.6792 1.13807 13.8043C1.01305 13.9293 0.843478 13.9995 0.666667 13.9995C0.489856 13.9995 0.320286 13.9293 0.195262 13.8043C0.0702379 13.6792 0 13.5097 0 13.3328ZM10.5533 3.33286C10.5533 3.50967 10.4831 3.67924 10.3581 3.80427C10.233 3.92929 10.0635 3.99953 9.88667 3.99953H6C4.76276 4.00094 3.57659 4.49306 2.70173 5.36792C1.82686 6.24278 1.33475 7.42895 1.33333 8.66619V9.80885C1.83305 9.24015 2.44833 8.78459 3.1381 8.47258C3.82788 8.16057 4.57627 7.9993 5.33333 7.99952H9.88667C10.0635 7.99952 10.233 8.06976 10.3581 8.19479C10.4831 8.31981 10.5533 8.48938 10.5533 8.66619V10.3902L14.4727 6.47086C14.5976 6.34584 14.6679 6.1763 14.6679 5.99953C14.6679 5.82275 14.5976 5.65321 14.4727 5.52819L10.5533 1.60887V3.33286Z" fill="#4A4B68"/>
      </svg>    
      ${obj.how_it_works.share_page.content.share_your_link || ""}
          </div>
 
       </div>
    <div class="how-it-works-step-widget" >
    <div class="how-it-works-step-image-widget">     
    <svg style="margin-right: 8px;width:16px;" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 16 16" fill="none">
   <g clip-path="url(#clip0_687_4309)">
   <path d="M4.66683 16.0004C5.40321 16.0004 6.00016 15.4035 6.00016 14.6671C6.00016 13.9307 5.40321 13.3338 4.66683 13.3338C3.93045 13.3338 3.3335 13.9307 3.3335 14.6671C3.3335 15.4035 3.93045 16.0004 4.66683 16.0004Z" fill="#4A4B68"/>
   <path d="M11.3333 16.0004C12.0697 16.0004 12.6667 15.4035 12.6667 14.6671C12.6667 13.9307 12.0697 13.3338 11.3333 13.3338C10.597 13.3338 10 13.9307 10 14.6671C10 15.4035 10.597 16.0004 11.3333 16.0004Z" fill="#4A4B68"/>
   <path d="M15.7899 0.890259C15.6649 0.765279 15.4954 0.695068 15.3186 0.695068C15.1418 0.695068 14.9723 0.765279 14.8473 0.890259L11.4079 4.33293L10.3739 3.25359C10.3133 3.19047 10.2407 3.13992 10.1605 3.10482C10.0803 3.06972 9.99399 3.05076 9.90646 3.04903C9.81892 3.04729 9.73191 3.06282 9.65037 3.09471C9.56884 3.12661 9.49438 3.17426 9.43126 3.23493C9.36814 3.2956 9.31758 3.36811 9.28248 3.44831C9.24738 3.52852 9.22843 3.61486 9.22669 3.70239C9.22319 3.87918 9.29006 4.05011 9.41259 4.17759L10.4886 5.29693C10.6032 5.42076 10.7418 5.52006 10.8959 5.58881C11.0501 5.65756 11.2165 5.69434 11.3853 5.69693H11.4073C11.5726 5.69747 11.7365 5.66516 11.8892 5.60188C12.042 5.53859 12.1807 5.44558 12.2973 5.32826L15.7899 1.83293C15.9149 1.70791 15.9851 1.53837 15.9851 1.36159C15.9851 1.18482 15.9149 1.01528 15.7899 0.890259V0.890259Z" fill="#4A4B68"/>
   <path d="M14.6 6.01067C14.5138 5.99509 14.4254 5.99666 14.3398 6.01527C14.2542 6.03388 14.1731 6.06918 14.1012 6.11914C14.0292 6.16911 13.9679 6.23276 13.9205 6.30646C13.8732 6.38016 13.8408 6.46246 13.8253 6.54867L13.74 7.02133C13.6568 7.48288 13.4141 7.90053 13.0543 8.20128C12.6944 8.50203 12.2403 8.66675 11.7713 8.66667H3.612L2.98533 3.33333H7.33333C7.51014 3.33333 7.67971 3.2631 7.80474 3.13807C7.92976 3.01305 8 2.84348 8 2.66667C8 2.48986 7.92976 2.32029 7.80474 2.19526C7.67971 2.07024 7.51014 2 7.33333 2H2.828L2.8 1.76533C2.74255 1.27907 2.50871 0.830769 2.14279 0.505403C1.77688 0.180036 1.30432 0.000208558 0.814667 0L0.666667 0C0.489856 0 0.320286 0.0702379 0.195262 0.195262C0.0702379 0.320286 0 0.489856 0 0.666667C0 0.843478 0.0702379 1.01305 0.195262 1.13807C0.320286 1.2631 0.489856 1.33333 0.666667 1.33333H0.814667C0.977955 1.33335 1.13556 1.3933 1.25758 1.50181C1.3796 1.61032 1.45756 1.75983 1.47667 1.922L2.394 9.722C2.48923 10.5332 2.87898 11.2812 3.48927 11.824C4.09956 12.3668 4.8879 12.6667 5.70467 12.6667H12.6667C12.8435 12.6667 13.013 12.5964 13.1381 12.4714C13.2631 12.3464 13.3333 12.1768 13.3333 12C13.3333 11.8232 13.2631 11.6536 13.1381 11.5286C13.013 11.4036 12.8435 11.3333 12.6667 11.3333H5.70467C5.29101 11.3334 4.88751 11.2052 4.54974 10.9664C4.21197 10.7276 3.95655 10.39 3.81867 10H11.7713C12.5529 10 13.3096 9.72549 13.9092 9.22429C14.5089 8.7231 14.9134 8.02713 15.052 7.258L15.1373 6.78467C15.1686 6.61079 15.1296 6.4316 15.0288 6.28648C14.9281 6.14135 14.7738 6.04215 14.6 6.01067Z" fill="#4A4B68"/>
   </g>
   <defs>
   <clipPath id="clip0_687_4309">
   <rect width="16" height="16" fill="white"/>
   </clipPath>
   </defs>
   </svg>${obj.how_it_works.share_page.content.your_friend_buys || ""}
       </div>
 
       </div>
         <div class="how-it-works-step-widget"  >
         <div class="how-it-works-step-image-widget" >     
         <svg style="margin-right: 8px;width:16px;" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 16 16" fill="none">
        <g clip-path="url(#clip0_687_4301)">
        <path d="M13.3333 4.66667H12.1747C12.5516 4.3344 12.8508 3.92325 13.051 3.4624C13.2513 3.00154 13.3477 2.50227 13.3333 2C13.3333 1.82319 13.2631 1.65362 13.1381 1.5286C13.013 1.40357 12.8435 1.33333 12.6667 1.33333C12.4899 1.33333 12.3203 1.40357 12.1953 1.5286C12.0702 1.65362 12 1.82319 12 2C12 3.748 10.4193 4.35333 9.21733 4.56067C9.66099 3.77404 9.92806 2.90025 10 2C10 1.46957 9.78929 0.960859 9.41421 0.585786C9.03914 0.210714 8.53043 0 8 0C7.46957 0 6.96086 0.210714 6.58579 0.585786C6.21071 0.960859 6 1.46957 6 2C6.07194 2.90025 6.33901 3.77404 6.78267 4.56067C5.58067 4.35333 4 3.748 4 2C4 1.82319 3.92976 1.65362 3.80474 1.5286C3.67971 1.40357 3.51014 1.33333 3.33333 1.33333C3.15652 1.33333 2.98695 1.40357 2.86193 1.5286C2.7369 1.65362 2.66667 1.82319 2.66667 2C2.65234 2.50227 2.74872 3.00154 2.94896 3.4624C3.1492 3.92325 3.4484 4.3344 3.82533 4.66667H2.66667C1.95942 4.66667 1.28115 4.94762 0.781049 5.44772C0.280952 5.94781 0 6.62609 0 7.33333L0 8C0 8.35362 0.140476 8.69276 0.390524 8.94281C0.640573 9.19286 0.979711 9.33333 1.33333 9.33333V12.6667C1.33439 13.5504 1.68592 14.3976 2.31081 15.0225C2.93571 15.6474 3.78294 15.9989 4.66667 16H11.3333C12.2171 15.9989 13.0643 15.6474 13.6892 15.0225C14.3141 14.3976 14.6656 13.5504 14.6667 12.6667V9.33333C15.0203 9.33333 15.3594 9.19286 15.6095 8.94281C15.8595 8.69276 16 8.35362 16 8V7.33333C16 6.62609 15.719 5.94781 15.219 5.44772C14.7189 4.94762 14.0406 4.66667 13.3333 4.66667ZM8 1.33333C8.17681 1.33333 8.34638 1.40357 8.47141 1.5286C8.59643 1.65362 8.66667 1.82319 8.66667 2C8.58619 2.70855 8.35915 3.39261 8 4.00867C7.64085 3.39261 7.41381 2.70855 7.33333 2C7.33333 1.82319 7.40357 1.65362 7.5286 1.5286C7.65362 1.40357 7.82319 1.33333 8 1.33333ZM1.33333 7.33333C1.33333 6.97971 1.47381 6.64057 1.72386 6.39052C1.97391 6.14048 2.31304 6 2.66667 6H7.33333V8H1.33333V7.33333ZM2.66667 12.6667V9.33333H7.33333V14.6667H4.66667C4.13623 14.6667 3.62753 14.456 3.25245 14.0809C2.87738 13.7058 2.66667 13.1971 2.66667 12.6667ZM13.3333 12.6667C13.3333 13.1971 13.1226 13.7058 12.7475 14.0809C12.3725 14.456 11.8638 14.6667 11.3333 14.6667H8.66667V9.33333H13.3333V12.6667ZM8.66667 8V6H13.3333C13.687 6 14.0261 6.14048 14.2761 6.39052C14.5262 6.64057 14.6667 6.97971 14.6667 7.33333V8H8.66667Z" fill="#4A4B68"/>
        </g>
        <defs>
        <clipPath id="clip0_687_4301">
        <rect width="16" height="16" fill="white"/>
        </clipPath>
        </defs>
        </svg>${obj.how_it_works.share_page.content.you_get_rewarded || ""}
            </div>
 
       </div>
      </div>
        </div> 
       </div>
       </div>
     </div>
   </div>
</div> 
  <div
 id="bixgrow-refer-widget-desktop-id"
 class="bixgrow-refer-widget ${
   obj.appearance_v2.launcher.desktop.type == "float"
     ? ""
     : "bixgrow-refer-widget-side"
 }" 
>
 <div
   id="bixgrow-refer-widget-content-id"
   class="
     bixgrow-refer-widget-content
   "

 >
 ${
   obj.appearance_v2.launcher.desktop.display_method.includes("icon")
     ? `<span class="bixgrow-refer-widget-icon__container"> ${
         obj.appearance_v2.launcher.icon_type == "existing"
           ? `<img  class="bixgrow-widget-icon"
 src="${
   "https://d2xrtfsb9f45pw.cloudfront.net/general/referral/" +
   obj.appearance_v2.launcher.icon +
   ".svg"
 }"
 alt="">`
           : `${
               obj.appearance_v2.launcher.icon_type == "upload" &&
               obj.appearance_v2.launcher.icon_upload
                 ? `<img
 class="bixgrow-widget-icon" src="${obj.appearance_v2.launcher.icon_upload}" alt="">`
                 : ""
             }`
       }               
</span>
`
     : ""
 }
${
  obj.appearance_v2.launcher.desktop.display_method.includes("text")
    ? ` <span class="bixgrow-refer-widget-content-text"> ${
        obj.content.join_page.launcher || ""
      }</span>`
    : ""
}
  
 </div>
 <div
   id="bixgrow-refer-widget-close-id"
   class="bixgrow-refer-widget-close"
 >
   <svg
     xmlns="http://www.w3.org/2000/svg"
     height="18"
     viewBox="0 0 329.26933 329"
     width="18" style="width:18px;height:18px;"
   >
     <path
       d="m194.800781 164.769531 128.210938-128.214843c8.34375-8.339844 8.34375-21.824219 0-30.164063-8.339844-8.339844-21.824219-8.339844-30.164063 0l-128.214844 128.214844-128.210937-128.214844c-8.34375-8.339844-21.824219-8.339844-30.164063 0-8.34375 8.339844-8.34375 21.824219 0 30.164063l128.210938 128.214843-128.210938 128.214844c-8.34375 8.339844-8.34375 21.824219 0 30.164063 4.15625 4.160156 9.621094 6.25 15.082032 6.25 5.460937 0 10.921875-2.089844 15.082031-6.25l128.210937-128.214844 128.214844 128.214844c4.160156 4.160156 9.621094 6.25 15.082032 6.25 5.460937 0 10.921874-2.089844 15.082031-6.25 8.34375-8.339844 8.34375-21.824219 0-30.164063zm0 0"
       fill="#ffff"
     />
   </svg>
 </div> 
 </div>
 <div
 id="bixgrow-refer-widget-mobile-id"    style="display:none;"
 class="bixgrow-refer-widget ${
   obj.appearance_v2.launcher.mobile.type == "float"
     ? ""
     : "bixgrow-refer-widget-side"
 }" 
>
 <div
   id="bixgrow-refer-widget-mobile-content-id"
   class="
     bixgrow-refer-widget-content
   "

 >
 ${
   obj.appearance_v2.launcher.mobile.display_method.includes("icon")
     ? `<span class="bixgrow-refer-widget-icon__container"> ${
         obj.appearance_v2.launcher.icon_type == "existing"
           ? `<img  class="bixgrow-widget-icon"
 src="${
   "https://d2xrtfsb9f45pw.cloudfront.net/general/referral/" +
   obj.appearance_v2.launcher.icon +
   ".svg"
 }"
 alt="">`
           : `${
               obj.appearance_v2.launcher.icon_type == "upload" &&
               obj.appearance_v2.launcher.icon_upload
                 ? `<img
 class="bixgrow-widget-icon" src="${obj.appearance_v2.launcher.icon_upload}" alt="">`
                 : ""
             }`
       }               
</span>
`
     : ""
 }
${
  obj.appearance_v2.launcher.mobile.display_method.includes("text")
    ? ` <span class="bixgrow-refer-widget-content-text"> ${
        obj.content_v2.mobile_launcher || ""
      }</span>`
    : ""
}
  
 </div>
 <div
   id="bixgrow-refer-widget-close-mobile-id"
   class="bixgrow-refer-widget-close"
 >
   <svg
     xmlns="http://www.w3.org/2000/svg"
     height="18"
     viewBox="0 0 329.26933 329"
     width="18" style="width:18px;height:18px;"
   >
     <path
       d="m194.800781 164.769531 128.210938-128.214843c8.34375-8.339844 8.34375-21.824219 0-30.164063-8.339844-8.339844-21.824219-8.339844-30.164063 0l-128.214844 128.214844-128.210937-128.214844c-8.34375-8.339844-21.824219-8.339844-30.164063 0-8.34375 8.339844-8.34375 21.824219 0 30.164063l128.210938 128.214843-128.210938 128.214844c-8.34375 8.339844-8.34375 21.824219 0 30.164063 4.15625 4.160156 9.621094 6.25 15.082032 6.25 5.460937 0 10.921875-2.089844 15.082031-6.25l128.210937-128.214844 128.214844 128.214844c4.160156 4.160156 9.621094 6.25 15.082032 6.25 5.460937 0 10.921874-2.089844 15.082031-6.25 8.34375-8.339844 8.34375-21.824219 0-30.164063zm0 0"
       fill="#ffff"
     />
   </svg>
 </div> 
 
 `;
  referralDiv.insertAdjacentHTML("beforeend", divContent);

  let linkReferralExist = bgGetCookie("bg_referral_advocate_link");
  if (!linkReferralExist) {
    if (customerEmail) {
      document.getElementById("bixgrow-email-advocate-widget").value =
        customerEmail;
      document.getElementById("bixgrow-name-advocate-widget").value =
        customerName;
    }
    let bixgrow_btn_invite_widget = document.getElementById(
      "bixgrow_btn_invite_widget"
    );
    bixgrow_btn_invite_widget.addEventListener("click", function ($event) {
      let noteEmail = document.getElementById(
        "note-bixgrow-email-advocate-widget"
      );
      let emailAdvocate = document.getElementById(
        "bixgrow-email-advocate-widget"
      );
      emailAdvocate.classList.remove("bixgrow-border-red");
      noteEmail.style.display = "none";
      let emailValue = emailAdvocate.value;
      let nameValue = document.getElementById(
        "bixgrow-name-advocate-widget"
      ).value;
      const checkBox = document.getElementById("bgWidgetMyCheckbox");
      const checkBoxValue = checkBox ? (checkBox.checked ? 1 : 0) : 0;
      if (!validateEmail(emailValue)) {
        noteEmail.innerHTML =
          obj.content.join_page.email_error_message ||
          "Please enter your correct email address";
        noteEmail.style.display = "block";
        emailAdvocate.classList.add("bixgrow-border-red");
      } else {
        bixgrow_btn_invite_widget.classList.add("bixgrow-loading");
        let xhttp = new XMLHttpRequest();
        xhttp.open(
          "POST",
          bixgrowReferralUrl + "/api/referral/advocates/register",
          true
        );
        xhttp.setRequestHeader("Content-Type", "application/json");
        let dataRegister = {
          email: emailValue,
          name: nameValue,
          shop: Shopify.shop,
          campain_id: campainId,
          locale: locale,
          enable_marketing_consent_request: checkBoxValue
        };
        xhttp.send(JSON.stringify(dataRegister));
        xhttp.onreadystatechange = function () {
          if (this.readyState == 4 && this.status == 200) {
            let objRegister = JSON.parse(this.responseText);
            if (Object.keys(objRegister).length > 0) {
              bgSetCookie(
                "bg_referral_advocate_link",
                objRegister.advocate.link,
                30
              );
              bgSetCookie("bg_is_same_browser", true, 30);
              document.getElementById(
                "bixgrow-referral-link-text-copy-widget"
              ).value = objRegister.advocate.link;
              let bixgrow_refer_content_input_invite = document.getElementById(
                "bixgrow_refer_content_input_invite_widget"
              );
              bixgrow_refer_content_input_invite.style.display = "none";
              if (obj.how_it_works.share_page.is_enable) {
                let bixgrow_how_it_works_widget = document.getElementById(
                  "bixgrow_how_it_works_widget"
                );
                bixgrow_how_it_works_widget.style.display = "block";
              }
              let bixgrow_refer_content_input_share = document.getElementById(
                "bixgrow_refer_content_input_share_widget"
              );
              bixgrow_refer_content_input_share.style.display = "block";
            } else {
              noteEmail.innerHTML = "An error occurred. Please try again later";
              noteEmail.style.display = "block";
              emailAdvocate.classList.add("bixgrow-border-red");
            }
          }
          if (this.readyState == 4 && this.status == 422) {
            let noteEmail = document.getElementById(
              "note-bixgrow-email-advocate-widget"
            );
            noteEmail.innerHTML = JSON.parse(this.responseText).message;
            noteEmail.style.display = "block";
            document
              .getElementById("bixgrow-email-advocate-widget")
              .classList.add("bixgrow-border-red");
            document
              .getElementById("bixgrow_btn_invite_widget")
              .classList.remove("bixgrow-loading");
          }
        };
        xhttp.onload = function () {};
      }
    });
  } else {
    document.getElementById("bixgrow-referral-link-text-copy-widget").value =
      bgGetCookie("bg_referral_advocate_link");
    let bixgrow_refer_content_input_invite = document.getElementById(
      "bixgrow_refer_content_input_invite_widget"
    );
    bixgrow_refer_content_input_invite.style.display = "none";
    if (obj.how_it_works.share_page.is_enable) {
      let bixgrow_how_it_works_widget = document.getElementById(
        "bixgrow_how_it_works_widget"
      );
      bixgrow_how_it_works_widget.style.display = "block";
    }
    let bixgrow_refer_content_input_share = document.getElementById(
      "bixgrow_refer_content_input_share_widget"
    );
    bixgrow_refer_content_input_share.style.display = "block";
  }

  let bixgrowReferWidgetId = document.getElementById(
    "bixgrow-refer-widget-desktop-id"
  );
  let bixgrowReferWidgetMobileId = document.getElementById(
    "bixgrow-refer-widget-mobile-id"
  );
  let bixgrowPopupReferral = document.getElementById("bixgrow-popup-referral");
  bixgrowReferWidgetId.addEventListener("click", function ($event) {
    if (obj.appearance_v2.launcher.desktop.type == "float") {
      bixgrowReferWidgetId.classList.toggle("bixgrow-active");
    }
    if (obj.appearance_v2.launcher.desktop.type == "side") {
      bixgrowReferWidgetId.classList.toggle("bixgrow-side-active");
    }
    referralDiv.classList.toggle("bixgrow-wrapper-active");
    bixgrowPopupReferral.classList.toggle("bixgrow-inactive");
    let bPoweredBy = document.getElementById("b-powered-by-widget-id");
    if (bPoweredBy) {
      bPoweredBy.classList.toggle("bixgrow-inactive");
    }
  });
  bixgrowReferWidgetMobileId.addEventListener("click", function ($event) {
    if (obj.appearance_v2.launcher.mobile.type == "float") {
      bixgrowReferWidgetMobileId.classList.toggle("bixgrow-active");
    }
    if (obj.appearance_v2.launcher.mobile.type == "side") {
      bixgrowReferWidgetId.classList.toggle("bixgrow-side-active");
    }
    bixgrowPopupReferral.classList.toggle("bixgrow-inactive");
    let bPoweredBy = document.getElementById("b-powered-by-widget-id");
    if (bPoweredBy) {
      bPoweredBy.classList.toggle("bixgrow-inactive");
    }
  });

  let bixgrow_close_popup_widget_mobile = document.getElementById(
    "bixgrow-close-popup-widget-mobile"
  );
  bixgrow_close_popup_widget_mobile.addEventListener("click", function () {
    bixgrowPopupReferral.classList.add("bixgrow-inactive");
    bixgrowReferWidgetId.classList.remove("bixgrow-active");
    bixgrowReferWidgetMobileId.classList.remove("bixgrow-active");
    referralDiv.classList.remove("bixgrow-wrapper-active");
    let bPoweredBy = document.getElementById("b-powered-by-widget-id");
    if (bPoweredBy) {
      bPoweredBy.classList.toggle("bixgrow-inactive");
    }
  });

  let bixgrow_close_popup_widget_desktop = document.getElementById(
    "bixgrow-close-popup-widget-desktop"
  );
  if (bixgrow_close_popup_widget_desktop) {
    bixgrow_close_popup_widget_desktop.addEventListener("click", function () {
      if (obj.appearance_v2.launcher.desktop.type == "side") {
        bixgrowReferWidgetId.classList.remove("bixgrow-side-active");
      }
      bixgrowPopupReferral.classList.add("bixgrow-inactive");
      referralDiv.classList.remove("bixgrow-wrapper-active");
      let bPoweredBy = document.getElementById("b-powered-by-widget-id");
      if (bPoweredBy) {
        bPoweredBy.classList.toggle("bixgrow-inactive");
      }
    });
  }

  let bixgrow_btn_copy_widget = document.getElementById(
    "bixgrow_btn_copy_widget"
  );
  bixgrow_btn_copy_widget.addEventListener("click", function ($event) {
    let bixgrowCopyOverlay = document.getElementById(
      "bixgrow-copy-overlay-widget"
    );
    let textBoxCopy = document.getElementById(
      "bixgrow-referral-link-text-copy-widget"
    );
    textBoxCopy.select();
    document.execCommand("copy");
    bixgrowCopyOverlay.style.display = "flex";
    setTimeout(() => {
      bixgrowCopyOverlay.style.display = "none";
    }, 1500);
  });

  referralDiv.style.display = "block";
}

function validateEmail(emailValue) {
  let bixgrow_reg =
    /^([A-Za-z0-9_\-\.\+])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
  if (bixgrow_reg.test(emailValue) == false) {
    return false;
  }
  return true;
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
function bgIsShowWidget(target, targetUrls = []) {
  let pathname = window.location.pathname;
  if (target == "all_page") {
    return true;
  }
  if (target == "specific_page") {
    let isShow = false;
    let languages = [
      "/vn",
      "/af",
      "/ak",
      "/sq",
      "/am",
      "/ar",
      "/hy",
      "/as",
      "/az",
      "/bm",
      "/bn",
      "/eu",
      "/be",
      "/bs",
      "/br",
      "/bg",
      "/my",
      "/ca",
      "/ckb",
      "/ce",
      "/zh-hant",
      "/zh-hans",
      "/kw",
      "/hr",
      "/cs",
      "/da",
      "/nl",
      "/dz",
      "/en",
      "/eo",
      "/et",
      "/ee",
      "/fo",
      "/fil",
      "/fi",
      "/fr",
      "/ff",
      "/gl",
      "/lg",
      "/ka",
      "/de",
      "/el",
      "/gu",
      "/ha",
      "/he",
      "/hi",
      "/hu",
      "/is",
      "/ig",
      "/id",
      "/ia",
      "/ga",
      "/it",
      "/ja",
      "/jv",
      "/kl",
      "/kn",
      "/ks",
      "/kk",
      "/km",
      "/ki",
      "/rw",
      "/ko",
      "/ku",
      "/ky",
      "/lo",
      "/lv",
      "/ln",
      "/lt",
      "/lu",
      "/lb",
      "/mk",
      "/mg",
      "/ms",
      "/ml",
      "/mt",
      "/gv",
      "/mr",
      "/mn",
      "/mi",
      "/ne",
      "/nd",
      "/se",
      "/no",
      "/nb",
      "/nn",
      "/or",
      "/om",
      "/os",
      "/ps",
      "/fa",
      "/pl",
      "/pt",
      "/pa",
      "/qu",
      "/ro",
      "/rm",
      "/rn",
      "/ru",
      "/sg",
      "/sa",
      "/sc",
      "/gd",
      "/sr",
      "/sn",
      "/ii",
      "/sd",
      "/si",
      "/sk",
      "/sl",
      "/so",
      "/es",
      "/su",
      "/sw",
      "/sv",
      "/tg",
      "/ta",
      "/tt",
      "/te",
      "/th",
      "/bo",
      "/ti",
      "/to",
      "/tr",
      "/tk",
      "/uk",
      "/ur",
      "/ug",
      "/uz",
      "/cy",
      "/fy",
      "/wo",
      "/xh",
      "/yi",
      "/yo",
      "/zu",
      "/zh",
    ];
    for (let i = 0; i < targetUrls.length; i++) {
      if (
        targetUrls[i] == "home_page" &&
        (pathname == "/" || languages.includes(pathname))
      ) {
        isShow = true;
        break;
      }
      if (
        targetUrls[i] == "product_pages" &&
        pathname &&
        pathname.includes("/products")
      ) {
        isShow = true;
        break;
      }
      if (
        targetUrls[i] == "collection_pages" &&
        pathname &&
        pathname.includes("/collections")
      ) {
        isShow = true;
        break;
      }
      if (
        targetUrls[i] == "cart_pages" &&
        pathname &&
        pathname.includes("/cart")
      ) {
        isShow = true;
        break;
      }
      if (
        targetUrls[i] == "blog_pages" &&
        pathname &&
        pathname.includes("/blogs")
      ) {
        isShow = true;
        break;
      }
    }
    return isShow;
  }
}
function detectDateFormat(dateString) {
  let d = new Date(dateString);
  return d.toLocaleDateString();
}
async function bgUseFetch(
  url,
  method = "GET",
  params = null,
  headers = { "Content-Type": "application/json" }
) {
  try {
    const options = {
      method: method,
      headers: {
        ...headers,
      },
    };
    if (params) {
      if (method == "GET") {
        const queryString = new URLSearchParams(params).toString();
        url += "?" + queryString;
      } else {
        options.body = JSON.stringify(params);
      }
    }
    const response = await fetch(url, options);
    if (!response.ok) {
      const errorData = await response.json();
      const error = new Error(
        errorData.message || response.statusText || "Request failed"
      );
      error.status = response.status;
      throw error;
    }
    const responseData = await response.json();
    return responseData;
  } catch (error) {
    throw error;
  }
}
