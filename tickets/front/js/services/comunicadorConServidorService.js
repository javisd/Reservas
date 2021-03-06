angular.module('reservasApp').service('comunicadorConServidorService',function($http, comunicadorEntreVistasService){	
	
	// Pendiente: pensar un nombre para el sistema ej:"reservas" pero que no se llame igual que uno de nuestros recursos HTTP.
	// (porque sino puede quedar blah.edu.ar/reservas/reservas/bleh y no queda bien)
	// Para hacer pruebas, acá y sólo acá es donde hay que poner la IP del servidor
	var url = '../back';
	// Nosotros NO vamos a tener un index.html porque el index es el de la página de sistemas que ya existe.
	// Nuestra página principal será otra, ej disilab.html
	// Y el favicon también es el que ya existe en la pag de sistemas, el nuestro hay que sacarlo.
	
	
	
	var codificarEnBase64 = function (input) {
        var output = "";
        var chr1, chr2, chr3 = "";
        var enc1, enc2, enc3, enc4 = "";
        var i = 0;
		
		var keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

        do {
            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);

            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;

            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }

            output = output +
                keyStr.charAt(enc1) +
                keyStr.charAt(enc2) +
                keyStr.charAt(enc3) +
                keyStr.charAt(enc4);
            chr1 = chr2 = chr3 = "";
            enc1 = enc2 = enc3 = enc4 = "";
        } while (i < input.length);

        return output;
    };
	
	
	
	
	return {
		obtenerLaboratorios: function(/*laboratorios, nombresDeLaboratorios*/){
			return $http.get( url + '/labs');
			// return $http.get( url + '/get_labs.php');
		},
		
		obtenerReservas: function(primerDiaSolicitado, cantDiasSolicitados){
			
			var begin = primerDiaSolicitado.getTime();
			var end = begin + cantDiasSolicitados * (24 * 60 * 60 * 1000);

			//return $http.get( url + '/reservations/' + primerDiaSolicitado.getFullYear() + '/' + ('0' + (primerDiaSolicitado.getMonth()+1)).slice(-2) + '/' + ('0' + primerDiaSolicitado.getDate()).slice(-2) + '?cant_dias=' + cantDiasSolicitados);
			//return $http.get( url + '/reservas' + '?from=' + from + '&to=' + to);
			
			return $http.get( url + '/reservations' + '?begin=' + begin + '&end=' + end);
			// return $http.get( url + '/get_reservations.php' + '?begin=' + begin + '&end=' + end);

			// El server NO debe leer la cookie. Siempre debe traer TODAS las reservas de la base
			// siempre en el rango de timestamps mandados.
		},

		obtenerPedidos: function (primerDiaSolicitado, cantDiasSolicitados) {
			
			var begin = primerDiaSolicitado.getTime();
			var end = begin + cantDiasSolicitados * (24 * 60 * 60 * 1000);
				
			return $http.get( url + '/reservations' + '?begin=' + begin + '&end=' + end + '&open_only=true');
			// return $http.get( url + '/get_reservations.php' + '?begin=' + begin + '&end=' + end + '&open_only=true');
			
			// El server debe leer la cookie. Si no hay usuario logueado, devuelve array vacio.
			// Si hay usuario y es docente, trae sus reservas solicitadas.
			// Si hay usuario y es encargado, trae TODAS las reservas solicitadas
			// siempre en el rango de timestamps mandados.
		},

		obtenerCursosDelDocente: function(cantDiasSolicitados, usuario){
			//El server debe traernos las materias que dicta el docente.
			//Los sistemas de la UTN aún no están preparados para esto,
			//así que quedará pendiente para otra fase.
		},
		
		obtenerMaterias: function() {
			return $http.get( url + '/subjects');
			// return $http.get( url + '/get_subjects.php');
		},
		
		cargarMateria: function(nombre, especialidad) {
			
			var materiaNueva = {};
			
			materiaNueva.nombre = nombre;
			materiaNueva.especialidad = especialidad;
			
			//return $http.post( url + '/subjects', materiaNueva); // asi deberia ser para que la API sea RESTful
			return $http.post( url + '/subjects/add', materiaNueva);
			// return $http.post( url + '/add_subject.php', materiaNueva);
		},
		
		enviarNuevaReserva: function(desde, hasta, idDeLaboratorio, materia, comentario) {
			
			var reservaNueva = {};
			
			// el creation date lo completa el servidor con la fecha actual
			//reservaNueva.creation_date = new Date().getTime();
			
			// el owner_id lo completa el servidor con el id del usuario logueado
			// (add_reservation.php linea 131)
			
			reservaNueva.begin = desde.getTime();
			reservaNueva.end = hasta.getTime();
			reservaNueva.lab_id = idDeLaboratorio;
			reservaNueva.subject = materia;
			reservaNueva.description = comentario;
			
			// el state lo completa el servidor
			// (add_reservation.php linea 141)
			
			return $http.post( url + '/reservations/add', reservaNueva); // asi deberia ser para que la API sea RESTful
			// return $http.post( url + '/add_reservation.php', reservaNueva);
		},
		
		confirmarReserva: function(id) {
			//return $http.get( url + '/reservas/' + id + '?action=confirm');
			//return $http.get( url + '/reservations/' + id + '?action=confirm');
			// return $http.get( url + '/reservations/' + id + '/confirm'); este anda
			
			return $http.post( url + '/reservations/' + id + '/confirm'); // OJO Post sin body es una mala practica, puede traer problemas
			// return $http.post( url + '/confirm_reservation.php?res_id=' + id); // OJO Post sin body es una mala practica, puede traer problemas
		},
		
		modificarReserva: function(id, beginNuevo, endNuevo, labNuevo, beginAnterior, endAnterior, labAnterior) {
			
			var reservaModificada = {};
			
			reservaModificada.begin = beginNuevo.getTime();
			reservaModificada.end = endNuevo.getTime();
			reservaModificada.lab_id = labNuevo;
			reservaModificada.description = "Pedido original: Laboratorio " +
				comunicadorEntreVistasService.getNombreDelLab(labAnterior) +
				", desde " + beginAnterior.getHours() + ":" + beginAnterior.getMinutes() +
				"hs hasta " + endAnterior.getHours() + ":" + endAnterior.getMinutes();


			//return $http.post( url + '/reservations/' + id + '/update', reservaModificada);
			return $http.post( url + '/modify_reservation.php?res_id=' + id, reservaModificada);
		},
		
		cancelarReserva: function(id) {
			//return $http.delete( url + '/reservations/' + id); // asi deberia ser para que la API sea RESTful
			
			return $http.post( url + '/reservations/' + id + '/delete'); // OJO Post sin body es una mala practica, puede traer problemas
			// return $http.post( url + 'delete_reservation.php?res_id=' + id); // OJO Post sin body es una mala practica, puede traer problemas
		},
		
		// Pendiente: el servidor tiene que devolver docentes, no todos los usuarios
		obtenerDocentes: function() {
			return $http.get( url + '/users');
			// return $http.get( url + '/get_users.php');
		},

		obtenerUnUsuario: function(id) {
			return $http.get( url + '/users/' + id);
			// return $http.get( url + '/get_users.php?user_id=' + id);
		},
		
		iniciarSesionConGLPI: function(username, password) {
			
			var passwordMD5 = CryptoJS.MD5(password);
			var authdata = codificarEnBase64(username + ':' + passwordMD5);
			$http.defaults.headers.common.Authorization = 'Basic ' + authdata;
			
			return $http.post( url + '/glpi_login') // OJO Post sin body es una mala practica, puede traer problemas
			// return $http.post( url + '/login.php?from_glpi=true') // OJO Post sin body es una mala practica, puede traer problemas
		},
		
		iniciarSesionConSinap: function() {
			return $http.post( url + '/sigma_login') // OJO Post sin body es una mala practica, puede traer problemas
			// return $http.post( url + '/login.php?from_sigma=true') // OJO Post sin body es una mala practica, puede traer problemas
		},
		
		cerrarSesion: function() {
			
			return $http.post( url + '/logout'); // OJO Post sin body es una mala practica, puede traer problemas
			// return $http.post( url + '/logout.php'); // OJO Post sin body es una mala practica, puede traer problemas
		},
		
		obtenerTerminales: function() {
			return $http.get( url + '/terminals');
		},
		
		obtenerUnaTerminal: function(id) {
			return $http.get( url + '/terminals/' + id);
		},
		
		eliminarTerminal: function(id) {
			return $http.post( url + '/terminals/' + id + '/delete');
		},
		
		agregarTerminal: function(terminal) {
			return $http.post( url + '/terminals/add', terminal);
		},
		
		modificarTerminal: function(terminal) {
			return $http.post( url + '/terminals/update', terminal);
		},
		
		obtenerSesiones: function(primerDiaSolicitado, cantDiasSolicitados){
			var begin = primerDiaSolicitado.getTime();
			var end = begin + cantDiasSolicitados * (24 * 60 * 60 * 1000);
			return $http.get( url + '/sessions' + '?begin=' + begin + '&end=' + end);
		},
		
		limpiarCredenciales: function() {
			$http.defaults.headers.common.Authorization = undefined;
		}
		
		
	}

})