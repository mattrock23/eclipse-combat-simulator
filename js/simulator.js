$(function () {
	function ShipGroup(type, side, initiative, quantity, cannons, missiles, computers, hulls, shields, extras) {
		this.type = type;
		this.side = side;
		this.initiative = initiative;
		this.quantity = quantity;
		this.cannons = cannons;
		this.missiles = missiles;
		this.computers = computers;
		this.hulls = hulls;
		this.shields = shields;
		this.extras = extras;
		this.retreating = false;
		this.id = idCounter++;
	}
	ShipGroup.prototype.toString = function() {
		return "<span class='quantity'>" + this.quantity.toString() + "</span> " + this.side.toString() + " " + this.type.toString() + " " + "ship(s) with " + 
			this.initiative.toString() + " initiative, " + this.cannons.join(", ") + /*", " + this.missiles.join(", ") + */", +" + 
			this.computers.toString() + " computers, " + this.hulls.toString() + " hull(s), -" + this.shields.toString() + 
			" shields.<br />"/* + (this.extras.join() || "and no extras") + ". "*/;
	}
	ShipGroup.prototype.makeDiv = function() {
		//return html representation of this shipgroup, id of the div should be the ship's id
	}
	ShipGroup.prototype.loadWeapons = function(kind) {
		//check if its still missile round
		//if so load the missiles of the first shipgroup in the missilebattle array
		//if not, load the cannons of the first shipgroup in the regular battle array
		//change display of active div in queue
		//display weapon icons
		$("#dicebox").empty();
		for (var i = 0; i < this.quantity; i++) {
			this.cannons.forEach(function(x) {
				//case variable and form values can be replaced with numeric values once the shipgroup.toString is no longer used
				switch (x) {
					case "Ion Cannon":
						$("<div class='icon' />").css('background-image', 'url(img/ion-icon.png)').appendTo("#dicebox");
						break;
					case "Plasma Cannon":
						$("<div class='icon' />").css('background-image', 'url(img/plasma-icon.png)').appendTo("#dicebox");
						break;
					case "Antimatter Cannon":
						$("<div class='icon' />").css('background-image', 'url(img/antimatter-icon.png)').appendTo("#dicebox");
						break;
				}
			});
		}
		//show which shipgroup is active in the queue
		$("#queue div").css('border', '1px solid #000');
		$("#" + this.id).css('border', '3px solid #000');
		//prompt retreat or fire
		$("#fire").add("#retreat").show();
		$("#next").hide();
	}
	ShipGroup.prototype.fireWeapons = function() {
		//check if it's still the missile round
		//fire the appropriate weapon type for each ship each weapon
		//roll, display dice
		$("#dicebox").empty();
		for (var i = 0; i < this.quantity; i++) {
			var self = this;
			this.cannons.forEach(function(x) {
				var face = Math.floor(1+Math.random()*6);
				var value;
				if (face == 6) value = "N6"
					else value = face + Number(self.computers);
				switch (x) {
					case "Ion Cannon":
						$("<div class='icon' />")
							.css('background-image', 'url(img/dice/ion-' + face + '.png)')
							.append('<input type="hidden" class="accuracy" value="' + value + '" /><input type="hidden" class="damage" value="1" />')
							.draggable({revert: true})
							.appendTo("#dicebox");
						break;
					case "Plasma Cannon":
						$("<div class='icon' />")
							.css('background-image', 'url(img/dice/plasma-' + face + '.png)')
							.append('<input type="hidden" class="accuracy" value="' + value + '" /><input type="hidden" class="damage" value="2" />')
							.draggable({revert: true})
							.appendTo("#dicebox");
						break;
					case "Antimatter Cannon":
						$("<div class='icon' />")
							.css('background-image', 'url(img/dice/antimatter-' + face + '.png)')
							.append('<input type="hidden" class="accuracy" value="' + value + '" /><input type="hidden" class="damage" value="4" />')
							.draggable({revert: true})
							.appendTo("#dicebox");
						break;
				}
			});
		}
		//make only enemy shipgroups droppable
		$("#queue div").droppable('disable');
		var enemies = this.getEnemies();
		enemies.forEach(function(x) {
			$("#" + x).droppable('enable');
		});
		$("#fire").add("#retreat").hide();
		$("#next").show();
		//if missile phase and any opposing ship has point defense, fire its cannons, check for antimatter splitter
		//firing player allocates missiles before point defense rolls, check enemy shields
		//assign damage, check for antimatter splitter
		//check to see if all enemy ships are dead
		//prompt for attack on population
		//if it's the missile round, just take the first element off
		//take element off the battle array and put it back on at the end
		battle.push(battle.shift());
	}
	ShipGroup.prototype.getIndex = function() {
		return battle.indexOf(this);
	}
	ShipGroup.prototype.getEnemies = function() {
		//returns an array with the ids of enemy shipgroups
		var result = [];
		var self = this;
		battle.forEach(function(x) {
			if (x.side != self.side) result.push(x.id);
		});
		return result;
	}

	function makeDropdown(event) {
		//make select elements to select weapons
		if (event.data.missle === 1) {
			$("#computercontainer").before("<select class='missile'>\
				<option value='Flux Missle'>Flux Missle</option>\
				<option value='Plasma Missle'>Plasma Missle</option>\
				</select><br />");
		} else {
			$("#computercontainer").before("<select class='cannon'>\
				<option value='Ion Cannon'>Ion Connon</option>\
				<option value='Plasma Cannon'>Plasma Cannon</option>\
				<option value='Antimatter Cannon'>Antimatter Cannon</option>\
				</select><br />");
		}
		return false;
	}
	function addShipGroup(event) {
		//validateInput();
		var cannons = [];
		var missiles = [];
		$(".cannon").each(function() {
			cannons.push(this.value);
		});
		$(".missile").each(function() {
			missiles.push(this.value);
		});
		var extras = [];
		/*if ($("#antimatter_splitter").is(':checked')) extras.push($("#antimatter_splitter").val());
		if ($("#distortion_shield").is(':checked')) extras.push($("#distortion_shield").val());
		if ($("#point_defense").is(':checked')) extras.push($("#point_defense").val());*/
		var ships = new ShipGroup($("#type").val(), $("#side").val(), $("#initiative").val(), $("#quantity").val(), 
			cannons, missiles, $("#computers").val(), $("#hulls").val(), $("#shields").val(), extras);
		battle.push(ships);
		battle.sort(firingOrder);
		console.log(battle);
		//create the visual display of the shipgroups
		$("#queue").empty().append("Queue:");
		battle.forEach(function(x) {
			$("#queue").append('<div id=' + x.id + '>' + x.toString() + 
				'Damage Taken: <span class="damage">0</span>' + 
				'<input type="hidden" name="shields" value="' + x.shields + 
				'" /></div>');
		});
		$("#queue div").droppable({accept: "#dicebox div", 
			drop: function(event, ui) {
				//determine if the shot can hit the shipgroup it was dropped on
				//the accuracy field within each draggable already includes computers
				if (ui.draggable.find("input.accuracy").val() - $(this).find("input").val() >= 6 || ui.draggable.find("input.accuracy").val() == "N6") {
					//display that the shot has been assigned and make it not draggable anymore
					ui.draggable.css("border", "1px solid #000").addClass("assigned").draggable('disable');
					//display the damage assigned
					$(this).find("span.damage").text(Number($(this).find("span.damage").text()) + Number(ui.draggable.find("input.damage").val()));
					var ship = getShipgroupById($(this).attr("id"));
					//reduce quantity of the shipgroup if a ship is destroyed
					if ($(this).find("span.damage").text() >= ship.hulls) {
						ship.quantity--;
						$(this).find("span.quantity").text(ship.quantity.toString());
						$(this).find("span.damage").text("0");
					}
					//remove from battle array and from queue if all the ships in a shipgroup are distroyed
					if (ship.quantity <= 0) {
						//remove the object from the battle array
						battle.splice(ship.getIndex(), 1);
						//and remove the div from the queue
						$("#" + ship.id).remove();
						checkForEnemies();
					}
				}
			}
		});
		$("#run").removeAttr('disabled');
		return false;
	}
	//firing order is determined by initiative. Ties go to the defenders
	function firingOrder(a, b) {
		if (a.initiative < b.initiative) return 1;
		if (a.initiative > b.initiative) return -1;
		if (a.initiative === b.initiative) {
			if (a.side === "Defending") {
				return -1;
			} else {
				return 1;
			}
		}
		return 0;
	}
	function validateInput() {
		//validate ship group form before adding it to the array and the queue
	}
	function initializeSimulation() {
		$("#shipgroupform").slideUp();
		$("#results").slideDown();
		//check for missiles
		//set up a separate array for missile order
		//order should include elements for missiles and for point defense responses
		//i.e. a ship can be in the missile array twice, it's possible
		//check for defender, if none, fire cannons at population
		//attackPopulation();
		//or skip straight to the main simulation
		step();
	}
	function step() {
		//check for retreating
		if (battle[0].retreating) {
			//remove the retreating shipgroup and its corresponding div
			$("#" + battle[0].id).remove();
			battle.splice(0, 1);
			checkForEnemies();
			step();
		} else {
			battle[0].loadWeapons();
		}
	}
	function setRetreat() {
		battle[0].retreating = true;
		//provide some display of retreating status
		$("#" + battle[0].id).html($("#" + battle[0].id).html() + " Retreating");
		//progress the battle array
		battle.push(battle.shift());
		step();
	}
	function getShipgroupById(id) {
		var ship;
		battle.forEach(function(x) {
			if (x.id == id) ship = x;
		});
		return ship;
	}
	function checkForEnemies() {
		if (!battle[0].getEnemies.length) alert("Winner! You may continue to roll for neutron bombs if applicable.");
	}

	var battle = [];
	var missileBattle = [];
	var missileRound = true;
	var idCounter = 0;
	$("#reset").click(function() {location.reload()});
	$("#addbutton").click(addShipGroup);
	$("#run").click(initializeSimulation);
	$("#addcannon").click({missle: 0}, makeDropdown);
	//$("#addmissle").click({missle: 1}, makeDropdown);
	$("#fire").click(function() {battle[0].fireWeapons()});
	$("#retreat").click(setRetreat);
	$("#next").click(step);
});