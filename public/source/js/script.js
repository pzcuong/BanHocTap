async function Submit() {
  try {
    var theButton = document.querySelector(".ld-over-full")
    theButton.classList.toggle("running")
    //prevent click button
    theButton.disabled = true;
  
  
    var formThongTinCaNhan = document.querySelector("#formElem1");
    var formThongTinXetTuyen = document.querySelector("#formElem2");
  
    data = {
      name: formThongTinCaNhan.querySelector("input[name=name]").value,
      email: formThongTinCaNhan.querySelector("input[name=email]").value,
      mssv: formThongTinCaNhan.querySelector("input[name=mssv]").value,
      LopSV: formThongTinCaNhan.querySelector("input[name=LopSV]").value,
      FacebookURL: formThongTinCaNhan.querySelector("input[name=FacebookURL]").value,
      LyDoThamGia: formThongTinXetTuyen.querySelector("textarea[name=LyDoThamGia]").value,
      TinhCachMuonLamViec: formThongTinXetTuyen.querySelector("input[name=TinhCachMuonLamViec]").value,
      TinhCachKhongMuonLamViec: formThongTinXetTuyen.querySelector("input[name=TinhCachKhongMuonLamViec]").value,
      TinhHuong: formThongTinXetTuyen.querySelector("textarea[name=TinhHuong]").value,
    }
  
    let url = window.location.href;
    let vitri = url.split("/")[4];
    if(vitri == 'Training') 
      data.CauHoi2 = formThongTinXetTuyen.querySelector("textarea[name=TinhHuongTraining]").value;
    else if(vitri == 'TruyenThong') {
      data.CauHoi2 = formThongTinXetTuyen.querySelector("textarea[name=KyNangTruyenThong]").value;
      data.ViTri = formThongTinCaNhan.querySelector("select[name=select]").value;
    }
    else if(vitri == 'Khac')
      data.CauHoi2 = formThongTinXetTuyen.querySelector("textarea[name=LyDoChonKhac]").value;
  
    const controller = new AbortController()

    // 5 second timeout:
    const timeoutId = setTimeout(() => controller.abort(), 20000)
    let response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
            json: true,
            signal: controller.signal
    }, {timeout: 20000});
    let result = await response.json();
    console.log(result);
    alert(result.message);
    theButton.classList.toggle("running")
    theButton.disabled = false;
    if(result.success == true) {
      window.location.href = url;
    }      
  } catch (error) {
    alert("Vui lòng kiểm tra lại thông tin và bấm submit để thử lại. Nếu vẫn không được vui lòng liên hệ trực tiếp với ban tổ chức qua fanpage của chúng tôi.");
    theButton.classList.toggle("running");
    theButton.disabled = false;
  }
  
}

async function SubmitRutGonLink(){
  var form = document.querySelector("#formElem");
  let data = {
      LongURL: form.querySelector("input[name='LongURL']").value,
      ShortURL: form.querySelector("input[name='ShortURL']").value,
      GhiChu: form.querySelector("input[name='GhiChu']").value
  }
  let res = await fetch("/rutgon", {
      method: "POST",
      headers: {
          "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
  })
  let result = await res.json();
  alert(result.message);
  console.log(result);
  if(result.success == true) {
    console.log(result);
    var img = document.createElement("img");
    var figcaption = document.createElement("FIGCAPTION");
    var captionText = document.createTextNode(result.link);

    img.src = result.qr;
    img.style.size = "150%";

    figcaption.appendChild(captionText);
    var src = document.getElementById("qrcode");
    src.appendChild(img);
    src.appendChild(figcaption);
  }

}