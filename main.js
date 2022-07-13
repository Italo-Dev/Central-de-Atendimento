const form = document.getElementById("form");
const formCpf = document.getElementById("cpf");
const formSubject = document.getElementById("subject");
var useFocus = false;
//teste ----------------------

function mascara(i) {
  var v = i.value;

  if (isNaN(v[v.length - 1])) {
    // impede entrar outro caractere que não seja número
    i.value = v.substring(0, v.length - 1);
    return;
  }

  i.setAttribute("maxlength", "14");
  if (v.length == 3 || v.length == 7) i.value += ".";
  if (v.length == 11) i.value += "-";
}

//------------------------

function showQRcode() {
  const urlSearchParams = new URLSearchParams(window.location.search);
  const params = Object.fromEntries(urlSearchParams.entries());
  if (params.totem) {
    document.querySelector(".qrcode").style.display = "block";
  }

  if (params.user != "") {
    if (params.user != undefined) {
      //-----------undefined error--------------------
      document.querySelector("#cpf").value = params.user;
      useFocus = true;
      setTimeout(() => {
        document.querySelector("#cpf").focus();
      }, 1000);
    }
  }
}

function checkInput() {
  const userCpfValue = formCpf.value;
  if (userCpfValue.length !== 14) {
    errorValidation(formCpf, "Preencha esse campo com 11 digitos");
  } else {
    successValidation(formCpf);
  }
}

showQRcode();
form.addEventListener("submit", (e) => {
  e.preventDefault();

  checkInput();
});

function errorValidation(input, message) {
  const cpfControl = input.parentElement;
  const small = cpfControl.querySelector("small");

  small.innerText = message;

  cpfControl.className = "testando error";
}

function successValidation(input) {
  const formCpf = input.parentElement;

  formCpf.className = "testando success";
}

var name = "";
var cpf = document.querySelector("#cpf");
["change", "focus"].forEach(function (e) {
  if (e == "focus" && !useFocus) {
    return;  
  }
  cpf.addEventListener(e, function () {
    if (cpf.value.length == 14) {
      checkInput();
      console.log("cpf tá completo");
      var xhr = new XMLHttpRequest();
      xhr.open(
        "GET",
        "https://centraldeatendimento.italo.br/api/v1/Contact?maxSize=1&offset=0&where%5B0%5D%5Btype%5D=equals&where%5B0%5D%5Battribute%5D=cpf&where%5B0%5D%5Bvalue%5D=" +
          cpf.value
      );
      xhr.setRequestHeader("Authorization", "Basic ZW51YmU6VHViYXJAMDE=");
      xhr.addEventListener("readystatechange", function () {
        if (this.readyState === 4) {
          if (this.status == 200) {
            var JSONdata = JSON.parse(this.responseText);
            console.log(JSONdata);
            if (JSONdata.total == 0) {
              // alert("não achei nenhum cadastro para esse CPF");
              $(".contact").modal("show");
              var contact = [];
              var fields = document.querySelectorAll(".modal.contact input");
              document
                .querySelector(".close-modal")
                .addEventListener("click", () => {
                  $(".contact").modal("hide");
                });
              document
                .querySelector(".create-contact")
                .addEventListener("click", function () {
                  console.log("click");
                  console.log(this);
                  fields.forEach(function (field) {
                    contact.push(field.value);
                  });
                  contact.push(cpf.value);
                  createContact(contact);
                });
            } else {
              const teste = document.querySelector(".teste");
              teste.style.display = "block";
              const qrcode = document.querySelector(".qrcode");
              qrcode.style.display = "none";
              var param = window.location.search.split("=");
              cpf = param[1];
              console.log(JSONdata.list[0].id);
              document.querySelector(".atendimento #nome").value =
                JSONdata.list[0].firstName;
              document.querySelector(".atendimento #email").value =
                JSONdata.list[0].emailAddress;
              document.querySelector(".atendimento #contact-id").value =
                JSONdata.list[0].id;
              name = JSONdata.list[0].name;
              // alert("achei o user");
              getOptions();
              var casePayload = [];
              document
                .querySelector(".create-case")
                .addEventListener("click", function (e) {
                  e.preventDefault();
                  console.log(document.querySelector("#subject").value);
                  if (document.querySelector("#subject").value == "") {
                    // alert("por favor, selecione um assunto");
                  } else {
                    var fields =
                      document.querySelectorAll(".atendimento input");
                    fields.forEach(function (field) {
                      casePayload.push(field.value);
                    });
                    var selectedElement = document.querySelector(
                      ".atendimento .subject"
                    ).options[
                      document.querySelector(".atendimento .subject")
                        .selectedIndex
                    ].computedName;
                    casePayload.push(selectedElement);

                    createCase(casePayload);
                  }
                });
            }
          }
        }
      });
      xhr.send();
    } else {
      console.log("errado");
    }
  });
});
function getOptions() {
  var xhr = new XMLHttpRequest();
  xhr.addEventListener("readystatechange", function () {
    if (this.readyState === 4) {
      if (this.status == 200) {
        var JSONdata = JSON.parse(this.responseText);
        console.log(JSONdata);
        var select = document.querySelector(".atendimento .subject");
        JSONdata.options.forEach(function (option) {
          var optTPL = `<option value="${option}">${option}</option>`;
          select.innerHTML += optTPL;
        });
      }
    }
  });

  xhr.open(
    "GET",
    "https://centraldeatendimento.italo.br/api/v1/Admin/fieldManager/Case/subject"
  );
  xhr.setRequestHeader("Authorization", "Basic ZW51YmU6VHViYXJAMDE=");

  xhr.send();
}
function createCase(casePayload) {
  var data = JSON.stringify({
    status: "New",
    priority: "Normal",
    type: "",
    subject: casePayload[4],
    contactId: casePayload[1],
    contactName: name,
    teamsIds: [],
    teamsNames: {},
    assignedUserName: null,
    assignedUserId: null,
  });

  var xhr = new XMLHttpRequest();
  xhr.open("POST", "https://centraldeatendimento.italo.br/api/v1/Case");
  xhr.setRequestHeader("Authorization", "Basic ZW51YmU6VHViYXJAMDE=");
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.addEventListener("readystatechange", function () {
    if (this.readyState === 4) {
      if (this.status == 200) {
        var JSONdata = JSON.parse(this.responseText);
        console.log(JSONdata);
        window.location.href =
          "agradecimento.html?callback_url=https://centraldeatendimento.italo.br/fila/index.html?totem=true";
      }
    }
  });
  xhr.send(data);
}
function createContact(contact) {
  var name = contact[0].split(" ");
  var data = JSON.stringify({
    firstName: name[0],
    lastName: name[1],
    phoneNumber: contact[1],
    emailAddress: contact[2],
    cpf: contact[3],
    description: null,
    assignedUserName: null,
    assignedUserId: null,
    teamsIds: [],
    teamsNames: {},
  });
  var xhr = new XMLHttpRequest();
  xhr.open("POST", "https://centraldeatendimento.italo.br/api/v1/Contact");
  xhr.setRequestHeader("Authorization", "Basic ZW51YmU6VHViYXJAMDE=");
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.addEventListener("readystatechange", function () {
    if (this.readyState === 4) {
      if (this.status === 200) {
        var JSONdata = JSON.parse(this.responseText);
        console.log(JSONdata);
        var url = new URL(window.location.href);
        url.searchParams.set("user", contact[3]);
        window.location.href = url.href;
        $(".contact").modal("hide");
      }
    }
  });
  xhr.send(data);
}
