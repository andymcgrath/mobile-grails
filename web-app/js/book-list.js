
function BookList() {
	this.books = [];
}

BookList.prototype.add = function(listBook) {
	this.books = listBook;
};

BookList.prototype.get = function(index) {
	return this.books[index];
};

serverUrl = 'http://localhost:8080/mobile-grails';
//serverUrl = 'http://mobile-grails.cloudfoundry.com'	

var global_map;
var pointMap = {}; 


$('#section-list-books').live('pageinit', function(e) {
	
	// Initialization of Map for list display
	var center = new google.maps.LatLng(0, 0);
	var myOptions = {
       zoom: 18,
	   center: center,
	   mapTypeId: google.maps.MapTypeId.ROADMAP
	};
    global_map = new google.maps.Map(document.getElementById("map-canvas-all"), myOptions);
	
    // Get domain objects		
	getBooks();
});


$('#list-all-books').live('click tap', function(e, ui) {
	hideMapDisplay();
	showListDisplay();
});

$('#map-all-books').live('click tap', function(e, ui) {
	hideListDisplay();
	showMapDisplay();
});

function hideListDisplay() {
	$('#list-books-parent').removeClass('visible');
	$('#list-books-parent').addClass('invisible');
}

function showMapDisplay() {
	$('#map-books-parent').removeClass('invisible');
	$('#map-books-parent').addClass('visible');
}

function showListDisplay() {
	$('#list-books-parent').removeClass('invisible');
	$('#list-books-parent').addClass('visible');
}

function hideMapDisplay() {
	$('#map-books-parent').removeClass('visible');
	$('#map-books-parent').addClass('invisible');
}


function getBooks() {
	$.ajax({
		cache : false,
		type : "GET",
		async : false,
		dataType : "jsonp",
		url : serverUrl + '/book/list',
		success : function(data) {
			if (data) {
				var bookList = new BookList();
				bookList.add(data);
				bookList.renderToHtml();
			}
		},
		error : function(xhr) {
			alert(xhr.responseText);
		}
	});
}

BookList.prototype.renderToHtml = function() {
	var context = this.books;
	for ( var i = 0; i < context.length; i++) {
		var book = context[i];
		addBookOnSection(book);
	}
	$('#list-books').listview('refresh');
	
	refreshCenterZoomMap();
	
}


function addBookOnSection (book) {
	var out = '<li><a href="#section-show-book?id='+ book.id + '" data-transition="fade" id="book'; 
	out =  out + book.id + '-in-list">';
	
//    out = out + book.isbn +';';
       out = out + book.title;
       
	out = out + '</a></li>';
	
	$("#section-list-books").data('Book_' + book.id, book);
	
	var marker = addMarkers(book);
	
	
	$(book).bind("refresh-book" + book.id + "-list", function(bind, newBook) {
		var book = $("#section-list-books").data('Book_' + newBook.id);
		var textDisplay = "";
	    textDisplay = textDisplay + newBook.author +';';
	       textDisplay = textDisplay + newBook.isbn +';';
	       textDisplay = textDisplay + newBook.title +';';
	       
		$('#book' + newBook.id + '-in-list').text(textDisplay);
		for(var property in newBook) {
			book[property] = newBook[property];
		}
		
		var marker = pointMap['Book_' + book.id + "_marker"];
		marker.setMap(null);
		var newMarker = addMarkers(newBook);
		refreshCenterZoomMap();
		
	});
	$("#list-books").append(out);
}

function addMarkers(book) {
	var marker = new google.maps.Marker({
		   position: new google.maps.LatLng(book.latitude, book.longitude),
		   map: global_map
		 });
	pointMap['Book_' + book.id + "_marker"] = marker;
}

function refreshCenterZoomMap() {
	var bounds = new google.maps.LatLngBounds();
	
	var previousZoom = global_map.getZoom();

	for (var key in pointMap) {
		var marker = pointMap[key];
		bounds.extend(marker.getPosition());
	}
	global_map.setCenter(bounds.getCenter());
	global_map.fitBounds(bounds);

	zoomChangeBoundsListener = 
	  google.maps.event.addListenerOnce(global_map, 'bounds_changed', function(event) {
		  if (!this.getZoom()){
			  this.setZoom(previousZoom);
		  }	
	  });
	setTimeout(function(){google.maps.event.removeListener(zoomChangeBoundsListener)}, 2000);	
	
}


function removeBookOnSection(id) {
	var listID = 'book' + id + '-in-list';
	var link = $("#" + listID);
	link.parents('li').remove();
	var book = $("#section-list-books").data('Book_' + id, book);
	$("#section-list-books").removeData('Book_' + id);
	$(book).unbind();
	$('#list-books').listview('refresh');
	
	var marker = pointMap['Book_' + book.id + "_marker"];
	marker.setMap(null);
	delete pointMap['Book_' + book.id + "_marker"];
	refreshCenterZoomMap();
	
}

