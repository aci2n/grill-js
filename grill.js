(function(grill) {
	
	function Matrix(logTargetSelector) {
		this.data = [];
		this.data[0] = [];
		this.labels = {row: [], col: []};
		this.debug = true;
		this.logTargetSelector = logTargetSelector;
	};
	
	Matrix.prototype.set = function(x, y, val) {
		if (!this.data[x]) {
			this.data[x] = [];
		}
		this.data[x][y] = parseInt(val, 10);
	};
	
	Matrix.prototype.loadFromHTMLTable = function(selector) {
		var table = document.querySelector(selector);
		if (!table) return;		
		
		for (var i = 0; i < table.rows.length; i++) {
			this.labels.row[i] = 'E' + (i + 1);
			var row = table.rows[i];
			for (var j = 0; j < row.cells.length; j++) {
				//add y labels on first row iterations only
				if (i === 0) {
					this.labels.col[j] = 'C' + (j + 1);
				}
				this.set(i, j, row.cells[j].textContent);
			}
		}
		
		return this;
	};
	
	Matrix.prototype.getCaller = function() {
		//don't h8
		var caller = this.getCaller.caller.caller;
		var name = '';
		
		for (var prop in this) {
			if (this[prop] === caller) {
				name = prop;
				break;
			}
		}
		
		return name;
	};
	
	Matrix.prototype.log = function() {
		var caller = '[' + this.getCaller() + '()]';
		
		if (this.debug) {
			console.log(caller);
			console.log('Matrix: ' + this.data.length + 'x' + this.data[0].length);
			console.log('\t' + this.labels.col.join('\t'));
			for (var i = 0; i < this.data.length; i++) {
				console.log(this.labels.row[i] + '\t' + this.data[i].join('\t'));
			}
		}
		
		var logTarget = document.querySelector(this.logTargetSelector);
		if (logTarget) {
			logTarget.innerHTML += '<h2>' + caller + '</h2>' + this.getHTML();
		}
	};
	
	Matrix.prototype.getHTML = function() {
		var html = '<table><thead><tr><th></th>';
		for (var i = 0; i < this.labels.col.length; i++) {
			html += '<th>' + this.labels.col[i] + '</th>';
		}		
		html += '</tr></thead><tbody>';
		
		var min = this.getMin();
		for (var i = 0; i < this.data.length; i++) {
			html += '<tr><td>' + this.labels.row[i] + '</td>';
			var row = this.data[i];
			for (var j = 0; j < row.length; j++) {
				var css = '';
				if (i === min.x && j === min.y) css += 'background-color:yellow;'
				else if (i === j) css += 'background-color:gray;'
				
				html += '<td' + (css ? ' style="' + css + '"' : '') + '>' + (j > i ? row[j] : '') + '</td>';
			}
			row += '</tr>';
		}		
		html += '</tbody></table>';
		
		return html;
	};
	
	Matrix.prototype.getOffsetMatrix = function(offsetCalculator, labelAxis) {
		var offsetMatrix = new Matrix(this.logTargetSelector);		
		offsetMatrix.labels.row = offsetMatrix.labels.col = this.labels[labelAxis].slice();
		offsetCalculator.call(this, offsetMatrix);
		offsetMatrix.log();
		return offsetMatrix;
	};
	
	Matrix.prototype.getOffsetMatrixX = function() {			
		return this.getOffsetMatrix((offsetMatrix) => {
			for (var i = 0; i < this.data.length; i++) {
				var firstRow = this.data[i];			
				for (var j = 0; j < this.data.length; j++) {
					var secondRow = this.data[j];				
					var offset = 0;
					for (var k = 0; i !== j && k < firstRow.length; k++) {
						offset += Math.abs(firstRow[k] - secondRow[k]);
					}
					offsetMatrix.set(i, j, offset);
				}
			}
		}, 'row');
	};
	
	Matrix.prototype.getOffsetMatrixY = function(complement) {
		return this.getOffsetMatrix((offsetMatrix) => {
			for (var i = 0; i < this.data[0].length; i++) {
				for (var j = 0; j < this.data[0].length; j++) {
					var offset = 0;
					for (var k = 0; i !== j && k < this.data.length; k++) {
						var subtrahend = this.data[k][j];
						if (complement) {
							subtrahend = complement + 1 - subtrahend; 
						}
						offset += Math.abs(this.data[k][i] - subtrahend);
					}
					offsetMatrix.set(i, j, offset);
				}
			}
		}, 'col');
	};
	
	Matrix.prototype.reduceOnce = function() {
		var min = this.getMin();
		
		var len = this.data.length;	
		this.labels.row[len] = (this.labels.row[min.x] + '-' + this.labels.row[min.y])
			.split('-')
			.sort((a, b) => parseInt(a.substr(1), 10) - parseInt(b.substr(1), 10))
			.join('-');
			
		for (var i = 0; i <= len; i++) {
			var val = Math.min(this.data[i][min.x], this.data[i][min.y]);
			this.set(i, len, val);
			this.set(len, i, val);
		}				
		
		this.removeRowColPair(min.x, min.y);
		
		this.log();
		
		return this;
	};
	
	Matrix.prototype.getMin = function() {
		var min = {val: Number.MAX_SAFE_INTEGER, x: -1, y: -1};
		
		for (var i = 0; i < this.data.length; i++) {
			var row = this.data[i];
			for (var j = 0; j < row.length; j++) {
				var val = row[j];
				if (val && val < min.val) {
					min.val = val;
					min.x = i;
					min.y = j;
				}
			}
		}
		
		return min;
	};
	
	Matrix.prototype.removeRowColPair = function(a, b) {
		[Math.min(a, b), Math.max(a, b) - 1].forEach(indexToRemove => {
			this.data.splice(indexToRemove, 1);
			for (var i = 0; i < this.data.length; i++) {
				this.data[i].splice(indexToRemove, 1);
			}					
			this.labels.row.splice(indexToRemove, 1);
		});	
		
		return this;
	};
	
	Matrix.prototype.reduceToEnd = function() {
		if (this.data.length < 3) {
			return this;
		}
		
		return this.reduceOnce().reduceToEnd();
	};

	Matrix.prototype.keepMinValuesAgainstComplement = function(complement) {
		return this.getOffsetMatrix((offsetMatrix) => {
			var complementCols = {};
			
			for (var i = 0; i < this.data.length; i++) {
				var row = this.data[i];
				
				for (var j = 0; j < row.length; j++) {
					var min = this.data[i][j];
					
					if (complement.data[i][j] < this.data[i][j]) {
						min = complement.data[i][j];
						if (j > i) {
							complementCols[j] = true;
						}
					}
					
					offsetMatrix.set(i, j, min);
				}
			}
			
			for (var i = 0; i < offsetMatrix.labels.row.length; i++) {
				if (complementCols[i]) {
					offsetMatrix.labels.row[i] = '~' + offsetMatrix.labels.row[i];
				}
			}
		}, 'col');
	};
	
	Matrix.prototype.getOffsetMatrixYKeepingMinAgainstComplement = function(complement) {
		return this.getOffsetMatrixY().keepMinValuesAgainstComplement(this.getOffsetMatrixY(complement));
	};
	
	grill.Matrix = Matrix;
	
})(window.grill = {});

document.body.innerHTML = '<style>table,tr,td,th{border: 1px solid black}</style><div id="grill-log"></div><table id="tablita" style="display:none"> <tbody>  <tr><td>2</td><td>2</td><td>4</td><td>1</td><td>1</td><td>2</td><td>2</td><td>1</td><td>1</td><td>1</td><td>1</td><td>1</td><td>1</td><td>1</td><td>5</td><td>3</td><td>3</td><td>2</td><td>2</td><td>2</td></tr>  <tr><td>4</td><td>4</td><td>1</td><td>1</td><td>3</td><td>3</td><td>1</td><td>1</td><td>1</td><td>1</td><td>1</td><td>1</td><td>1</td><td>1</td><td>3</td><td>1</td><td>1</td><td>1</td><td>1</td><td>1</td></tr>  <tr><td>3</td><td>3</td><td>4</td><td>3</td><td>2</td><td>4</td><td>2</td><td>4</td><td>1</td><td>1</td><td>1</td><td>2</td><td>1</td><td>1</td><td>3</td><td>2</td><td>1</td><td>1</td><td>1</td><td>1</td></tr>  <tr><td>1</td><td>1</td><td>1</td><td>1</td><td>2</td><td>3</td><td>1</td><td>1</td><td>2</td><td>1</td><td>2</td><td>1</td><td>4</td><td>3</td><td>1</td><td>1</td><td>1</td><td>1</td><td>2</td><td>1</td></tr>  <tr><td>1</td><td>1</td><td>1</td><td>3</td><td>5</td><td>2</td><td>1</td><td>4</td><td>1</td><td>2</td><td>2</td><td>1</td><td>2</td><td>1</td><td>1</td><td>1</td><td>1</td><td>2</td><td>1</td><td>1</td></tr>  <tr><td>4</td><td>4</td><td>5</td><td>4</td><td>4</td><td>4</td><td>2</td><td>5</td><td>1</td><td>4</td><td>1</td><td>3</td><td>4</td><td>1</td><td>2</td><td>1</td><td>2</td><td>1</td><td>2</td><td>1</td></tr>  <tr><td>1</td><td>1</td><td>1</td><td>3</td><td>5</td><td>1</td><td>1</td><td>1</td><td>1</td><td>1</td><td>1</td><td>1</td><td>1</td><td>1</td><td>1</td><td>1</td><td>1</td><td>1</td><td>1</td><td>3</td></tr>  <tr><td>2</td><td>1</td><td>2</td><td>2</td><td>3</td><td>1</td><td>1</td><td>4</td><td>4</td><td>2</td><td>2</td><td>1</td><td>1</td><td>1</td><td>1</td><td>2</td><td>1</td><td>1</td><td>1</td><td>2</td></tr>  <tr><td>1</td><td>1</td><td>3</td><td>2</td><td>3</td><td>3</td><td>1</td><td>1</td><td>2</td><td>1</td><td>2</td><td>1</td><td>4</td><td>3</td><td>3</td><td>1</td><td>1</td><td>1</td><td>1</td><td>1</td></tr>  <tr><td>1</td><td>1</td><td>1</td><td>3</td><td>1</td><td>3</td><td>1</td><td>1</td><td>1</td><td>1</td><td>1</td><td>1</td><td>5</td><td>1</td><td>1</td><td>1</td><td>1</td><td>1</td><td>1</td><td>1</td></tr>  <tr><td>1</td><td>1</td><td>2</td><td>2</td><td>2</td><td>3</td><td>2</td><td>2</td><td>1</td><td>2</td><td>2</td><td>1</td><td>1</td><td>1</td><td>3</td><td>2</td><td>1</td><td>1</td><td>1</td><td>1</td></tr>  <tr><td>1</td><td>1</td><td>3</td><td>4</td><td>4</td><td>2</td><td>1</td><td>1</td><td>2</td><td>1</td><td>2</td><td>1</td><td>3</td><td>2</td><td>2</td><td>1</td><td>1</td><td>1</td><td>1</td><td>1</td></tr>  <tr><td>2</td><td>2</td><td>1</td><td>2</td><td>2</td><td>4</td><td>3</td><td>1</td><td>1</td><td>1</td><td>4</td><td>1</td><td>1</td><td>5</td><td>1</td><td>1</td><td>1</td><td>1</td><td>1</td><td>1</td></tr>  <tr><td>1</td><td>1</td><td>1</td><td>1</td><td>2</td><td>5</td><td>1</td><td>1</td><td>1</td><td>1</td><td>2</td><td>2</td><td>4</td><td>3</td><td>1</td><td>1</td><td>1</td><td>1</td><td>1</td><td>1</td></tr> </tbody></table>';

var matrix = new grill.Matrix('#grill-log').loadFromHTMLTable('#tablita');
//elements
matrix.getOffsetMatrixX().reduceToEnd();
//characteristics
matrix.getOffsetMatrixYKeepingMinAgainstComplement(5).reduceToEnd();