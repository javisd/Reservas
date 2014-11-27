angular.module('reservasApp').controller('pedidoDeReservaCtrl',function($scope, $state, comunicadorConServidorService, comunicadorEntreVistasService, ayudaService){
	var vistaAnterior = comunicadorEntreVistasService;
	var ayuda = ayudaService;
	var servidor = comunicadorConServidorService;
	
    ayuda.actualizarExplicaciones();
    $scope.margen = ayuda.getMargen();

	if(!vistaAnterior.getUsuario().inicioSesion){
		$state.go('planillaReservas');
	};

	$scope.evento = vistaAnterior.getEventos()[0];
	
	// El rango libre es todo el tiempo libre contiguo al punto del click
	$scope.rangoLibre = {desde: $scope.evento.desde.getHours()*60+$scope.evento.desde.getMinutes(),
						 hasta: $scope.evento.hasta.getHours()*60+$scope.evento.hasta.getMinutes()}; // PENDIENTE No esta llegando bien el pedazo libre clickeado

	$scope.materia = $scope.evento.subject;
	
	if(vistaAnterior.getUsuario().esEncargado && $scope.materia) {
		$scope.docente = vistaAnterior.getUsuario().docenteElegido;
	}
	else {
		$scope.docente = vistaAnterior.getUsuario();
	};
	
	
	/* No tenemos info sobre cursos
	$scope.franjasHorariasEnMinutos = [
		{de: 600, a: 840, tipo: 'libre', clickeada: false},
		{de: 840, a: 1080, tipo: 'libre y coincide con su materia', clickeada: false},
		{de: 1080, a: 1200, tipo: 'libre', clickeada: true}//Supongamos que quiere reservar un rato LUEGO de su clase por X motivo.
	];
	*/	
	
	
	$scope.minimoPermitido = function() {
		//return $scope.franjasHorariasEnMinutos[0].de; No tenemos info sobre cursos
		return $scope.rangoLibre.desde;
	};
	
	$scope.maximoPermitido = function() {
		//return $scope.franjasHorariasEnMinutos[$scope.franjasHorariasEnMinutos.length - 1].a; No tenemos info sobre cursos
		return $scope.rangoLibre.hasta;
	}
	
	/* No tenemos info sobre cursos
	var franjaClickeada = $scope.franjasHorariasEnMinutos.filter(
		function(unaFranja) {
			return unaFranja.clickeada;
		}
	)[0];
	*/
	
	//var franjaSeleccionadaInicio = franjaClickeada.de; No tenemos info sobre cursos
	var franjaSeleccionadaInicio = $scope.rangoLibre.desde;
	//var franjaSeleccionadaFin = franjaClickeada.a; No tenemos info sobre cursos
	var franjaSeleccionadaFin = $scope.rangoLibre.hasta;
	//var franjaSeleccionadaTipo = franjaClickeada.tipo; No tenemos info sobre cursos
	var franjaSeleccionadaTipo = 'libre';
	//var franjaSeleccionadaClickeada = franjaClickeada.clickeada; No tenemos info sobre cursos
	var franjaSeleccionadaClickeada = true;
	
	$scope.franjaSeleccionada = {desde: franjaSeleccionadaInicio, hasta: franjaSeleccionadaFin, tipo: franjaSeleccionadaTipo, clickeada: franjaSeleccionadaClickeada};
	
	/* No tenemos info sobre cursos
	$scope.laFranjaEstaPerfecta = false;
	
	$scope.eseHorarioNoEsPropio = function(franjaSeleccionada) {
		
		var estaLibreYEsDeSuMateria = function(unaFranja) {
			return unaFranja.tipo == 'libre y coincide con su materia';
		};
		
		var franjaLibreYDeSuMateria = $scope.franjasHorariasEnMinutos.filter(estaLibreYEsDeSuMateria)[0];
		
		var estaContenidaEn = function(franjaContenida, franjaContenedora) {
			return (franjaContenida.de >= franjaContenedora.de && franjaContenida.a <= franjaContenedora.a);
		};
		
		if(estaContenidaEn(franjaSeleccionada, franjaLibreYDeSuMateria)) {
			
			$scope.laFranjaEstaPerfecta = true;
			return false;
		}
		else {
			
			$scope.laFranjaEstaPerfecta = false;
			return true;
		};
	}
	
	$scope.justificacionIngresada = '';
	
	$scope.pareceQueNoJustifico = function() {
		return !$scope.laFranjaEstaPerfecta && $scope.justificacionIngresada.length <= 2;
	}
	*/
	
	$scope.enviarSolicitud = function() {
		var horasDesde = Math.floor($scope.franjaSeleccionada.desde/60);
		var minutosDesde = $scope.franjaSeleccionada.desde - horasDesde*60;
		$scope.evento.desde.setHours(horasDesde,minutosDesde,0,0);

		var horasHasta = Math.floor($scope.franjaSeleccionada.hasta/60);
		var minutosHasta = $scope.franjaSeleccionada.hasta - horasDesde*60;
		$scope.evento.hasta.setHours(horasDesde,minutosDesde,0,0);

		servidor.enviarNuevaReserva($scope.evento.laboratorio, $scope.evento.desde, $scope.evento.hasta, 'solicitada')
		.success(function(data, status, headers, config) {
			console.log('Enviada la solicitud de reserva exitosamente' + ' (' + $scope.materia + ' en el lab ' + $scope.evento.laboratorio + ' el d\xEDa ' + $scope.evento.desde + ')');
			alert('Su solicitud fue recibida exitosamente!');
			$state.go('planillaReservas');
		})
		.error(function(data, status, headers, config) {
			console.log('Se produjo un error al enviar la solicitud de reserva' + ' (' + $scope.materia + ' en el lab ' + $scope.evento.laboratorio + ' el d\xEDa ' + $scope.evento.desde + ')');
			alert('Se produjo un error. Pruebe tocando Listo nuevamente.');
			
			// TEMP
			$state.go('planillaReservas');
		});
	}

	$scope.volver = function(){
		$state.go('planillaReservas');
	}
	
});



// En otro archivo
angular.module('reservasApp').filter('hourMinFilter', function () {
    return function (fecha) {
		return fecha.getHours().toString() + ':' + fecha.getMinutes().toString();
    };
});