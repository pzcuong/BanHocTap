async function Submit() {
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
  else if(vitri == 'TruyenThong')
    data.CauHoi2 = formThongTinXetTuyen.querySelector("textarea[name=KyNangTruyenThong]").value;
  else if(vitri == 'Khac')
    data.CauHoi2 = formThongTinXetTuyen.querySelector("textarea[name=LyDoChonKhac]").value;

  let response = await fetch(url, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
          json: true
  })
  let result = await response.json();
  alert(result.message);
  theButton.classList.toggle("running");
  theButton.disabled = false;
}

