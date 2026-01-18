$(document).ready(function() {

  function animarSaldo(selector) {
    const elem = $(selector);
    elem.addClass("saldo-anim");
    setTimeout(() => elem.removeClass("saldo-anim"), 600);
  }

  function mostrarSaldo(selector) {
    const saldo = parseFloat(localStorage.getItem("walletBalance")) || 0;
    $(selector).text("$" + saldo.toLocaleString());
    animarSaldo(selector);
    return saldo;
  }

  // Dashboard
  if ($("#saldoDisplay").length) {
    mostrarSaldo("#saldoDisplay");
  }

  // Depósito
  if ($("#depositForm").length) {
    mostrarSaldo("#saldoActual");

    $("#depositForm").submit(function(e) {
      e.preventDefault();
      const monto = parseFloat($("#depositAmount").val());
      if (monto > 0) {
        let saldo = parseFloat(localStorage.getItem("walletBalance")) || 0;
        const nuevoSaldo = saldo + monto;
        localStorage.setItem("walletBalance", nuevoSaldo.toFixed(2));
        mostrarSaldo("#saldoActual");

        let historial = JSON.parse(localStorage.getItem("walletTransactions")) || [];
        historial.unshift({
          tipo: "Depósito (Ingreso)",
          monto: monto,
          fecha: new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
        });
        localStorage.setItem("walletTransactions", JSON.stringify(historial));

        $("#alert-container").html(`
          <div class="alert alert-success text-center mt-3">
            ¡Depósito de $${monto.toLocaleString()} exitoso!
          </div>
        `);
      }
    });
  }

  // Enviar dinero
  if ($("#sendForm").length) {
    $(".contact-item").click(function() {
      $("#dest").val($(this).text());
      $(".contact-item").removeClass("active");
      $(this).addClass("active");
    });

    $("#sendForm").submit(function(e) {
      e.preventDefault();
      const monto = parseFloat($("#monto").val());
      let saldo = parseFloat(localStorage.getItem("walletBalance")) || 0;
      if (monto <= saldo && monto > 0) {
        const nuevoSaldo = saldo - monto;
        localStorage.setItem("walletBalance", nuevoSaldo.toFixed(2));
        mostrarSaldo("#saldoDisplay");

        let historial = JSON.parse(localStorage.getItem("walletTransactions")) || [];
        historial.unshift({
          tipo: "Envío a " + $("#dest").val(),
          monto: -monto,
          fecha: new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
        });
        localStorage.setItem("walletTransactions", JSON.stringify(historial));
        window.location.href = "menu.html";
      } else {
        $("#alert-container").html(`
          <div class="alert alert-danger text-center mt-3">
            Saldo insuficiente
          </div>
        `);
      }
    });
  }

  // Historial de transacciones
  if ($("#listaMovimientos").length) {
    const historial = JSON.parse(localStorage.getItem("walletTransactions")) || [];
    historial.forEach(m => {
      const color = m.monto > 0 ? "text-success" : "text-danger";
      $("#listaMovimientos").append(`
        <li class="list-group-item d-flex justify-content-between">
          <div><b>${m.tipo}</b><br><small>${m.fecha}</small></div>
          <span class="${color} fw-bold">$${Math.abs(m.monto)}</span>
        </li>
      `);
    });

    $("#botonLimpiarHistorial").click(function() {
      if (confirm("¿Estás seguro de que quieres borrar todo el historial?")) {
        localStorage.setItem("walletTransactions", "[]");
        $("#listaMovimientos").empty();
        $("#listaMovimientos").before(`
          <div class="alert alert-success text-center mt-2">
            Historial reiniciado correctamente.
          </div>
        `);
      }
    });
  }

});
