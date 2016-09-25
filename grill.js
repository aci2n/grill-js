(function(grill) {
	
	function Matrix() {
		this.data = [];
		this.data[0] = [];
		this.header = [];
		this.debug = true;
	};
	
	Matrix.prototype.clone = function() {
		var clonedMatrix = new Matrix();
		
		for (var i = 0; i < this.data.length; i++) {
			var row = this.data[i];
			for (var j = 0; j < row.length; j++) {
				clonedMatrix.set(i, j, row[j]);
			}
		}
		
		clonedMatrix.header = this.header;
		
		return clonedMatrix;
	};
	
	Matrix.prototype.removeRowsAndColumns = function(a, b) {
		if (a === b) return;
		
		var removeFirst = Math.min(a, b);
		var removeSecond = Math.max(a, b) - 1;
		
		this.data.splice(removeFirst, 1);
		this.data.splice(removeSecond, 1);
		
		for (var i = 0; i < this.data.length; i++) {
			this.data[i].splice(removeFirst, 1);
			this.data[i].splice(removeSecond, 1);
		}
		
		this.header.splice(removeFirst, 1);
		this.header.splice(removeSecond, 1);
	};
	
	Matrix.prototype.set = function(x, y, val) {
		if (!this.data[x]) {
			this.data[x] = [];
		}
		this.data[x][y] = parseInt(val, 10);
	};
	
	Matrix.prototype.loadFromTable = function(locator) {
		var table = document.querySelector(locator);
		if (!table) return;

		var headerRow = table.rows[0];
		for (var j = 0; j < headerRow.cells.length; j++) {
			this.header[j] = headerRow.cells[j].textContent;
		}
		
		for (var i = 1; i < table.rows.length; i++) {
			var row = table.rows[i];
			for (var j = 0; j < row.cells.length; j++) {
				this.set(i - 1, j, row.cells[j].textContent);
			}
		}
		
		this.log();
		
		return this;
	};
	
	Matrix.prototype.log = function() {
		if (this.debug) {		
			console.log('Matrix: ' + this.data.length + 'x' + this.data[0].length);
			for (var i = 0; i < this.data.length; i++) {
				console.log(this.header[i] + '\t' + this.data[i].join('\t'));
			}
		}
		
		var grillLog = document.getElementById('grill-log');
		if (grillLog) {
			var html = '<table><tbody>';
			for (var i = 0; i < this.data.length; i++) {
				html += '<tr><td>' + this.header[i] + '</td>';
				var row = this.data[i];
				for (var j = 0; j < row.length; j++) {
					html += '<td>' + row[j] + '</td>';
				}
				html += '</tr>';
			}
			html += '</tbody></table>';
			
			grillLog.innerHTML += html;
		}
	};
	
	Matrix.prototype.getOffsetMatrix = function() {
		var offsetMatrix = new Matrix(); //immutability papa
			
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
		
		offsetMatrix.header = this.header;
		
		offsetMatrix.log();
		
		return offsetMatrix;
	};	
	
	Matrix.prototype.reduceOnce = function() {
		var reducedMatrix = this.clone();
		
		var minVal = Number.MAX_SAFE_INTEGER;
		var minX = -1;
		var minY = -1;
		
		for (var i = 0; i < reducedMatrix.data.length; i++) {
			var row = reducedMatrix.data[i];
			for (var j = 0; j < row.length; j++) {
				var val = row[j];
				if (val && val < minVal) {
					minVal = val;
					minX = i;
					minY = j;
				}
			}
		}
		
		var len = reducedMatrix.data.length;
		this.header[len] = this.header[minX] + '-' + this.header[minY];
		for (var i = 0; i < len; i++) {
			var val = Math.min(reducedMatrix.data[i][minX], reducedMatrix.data[i][minY]);
			reducedMatrix.set(i, len, val);
			reducedMatrix.set(len, i, val);
		}
		reducedMatrix.set(len, len, 0);
		
		reducedMatrix.removeRowsAndColumns(minX, minY);
		
		reducedMatrix.log();
		
		return reducedMatrix;
	};
	
	Matrix.prototype.reduceToEnd = function() {
		if (this.data.length === 1) {
			return this;
		}
		return this.reduceOnce().reduceToEnd();
	};
	
	grill.Matrix = Matrix;
	
})(window.grill = {});

document.body.innerHTML = '<style>table,tr,td{border: 1px solid black}</style><div id="grill-log"></div><table id="tablita"> 	<thead><tr><th>E1</th><th>E2</th><th>E3</th><th>E4</th><th>E5</th><th>E6</th><th>E7</th><th>E8</th><th>E9</th><th>E10</th><th>E11</th><th>E12</th><th>E13</th><th>E14</th></tr></thead><tbody>  <tr><td>2</td><td>2</td><td>4</td><td>1</td><td>1</td><td>2</td><td>2</td><td>1</td><td>1</td><td>1</td><td>1</td><td>1</td><td>1</td><td>1</td><td>5</td><td>3</td><td>3</td><td>2</td><td>2</td><td>2</td></tr> <tr><td>4</td><td>4</td><td>1</td><td>1</td><td>3</td><td>3</td><td>1</td><td>1</td><td>1</td><td>1</td><td>1</td><td>1</td><td>1</td><td>1</td><td>3</td><td>1</td><td>1</td><td>1</td><td>1</td><td>1</td></tr>  <tr><td>3</td><td>3</td><td>4</td><td>3</td><td>2</td><td>4</td><td>2</td><td>4</td><td>1</td><td>1</td><td>1</td><td>2</td><td>1</td><td>1</td><td>3</td><td>2</td><td>1</td><td>1</td><td>1</td><td>1</td></tr>  <tr><td>1</td><td>1</td><td>1</td><td>1</td><td>2</td><td>3</td><td>1</td><td>1</td><td>2</td><td>1</td><td>2</td><td>1</td><td>4</td><td>3</td><td>1</td><td>1</td><td>1</td><td>1</td><td>2</td><td>1</td></tr>  <tr><td>1</td><td>1</td><td>1</td><td>3</td><td>5</td><td>2</td><td>1</td><td>4</td><td>1</td><td>2</td><td>2</td><td>1</td><td>2</td><td>1</td><td>1</td><td>1</td><td>1</td><td>2</td><td>1</td><td>1</td></tr>  <tr><td>4</td><td>4</td><td>5</td><td>4</td><td>4</td><td>4</td><td>2</td><td>5</td><td>1</td><td>4</td><td>1</td><td>3</td><td>4</td><td>1</td><td>2</td><td>1</td><td>2</td><td>1</td><td>2</td><td>1</td></tr>  <tr><td>1</td><td>1</td><td>1</td><td>3</td><td>5</td><td>1</td><td>1</td><td>1</td><td>1</td><td>1</td><td>1</td><td>1</td><td>1</td><td>1</td><td>1</td><td>1</td><td>1</td><td>1</td><td>1</td><td>3</td></tr>  <tr><td>2</td><td>1</td><td>2</td><td>2</td><td>3</td><td>1</td><td>1</td><td>4</td><td>4</td><td>2</td><td>2</td><td>1</td><td>1</td><td>1</td><td>1</td><td>2</td><td>1</td><td>1</td><td>1</td><td>2</td></tr>  <tr><td>1</td><td>1</td><td>3</td><td>2</td><td>3</td><td>3</td><td>1</td><td>1</td><td>2</td><td>1</td><td>2</td><td>1</td><td>4</td><td>3</td><td>3</td><td>1</td><td>1</td><td>1</td><td>1</td><td>1</td></tr>  <tr><td>1</td><td>1</td><td>1</td><td>3</td><td>1</td><td>3</td><td>1</td><td>1</td><td>1</td><td>1</td><td>1</td><td>1</td><td>5</td><td>1</td><td>1</td><td>1</td><td>1</td><td>1</td><td>1</td><td>1</td></tr>  <tr><td>1</td><td>1</td><td>2</td><td>2</td><td>2</td><td>3</td><td>2</td><td>2</td><td>1</td><td>2</td><td>2</td><td>1</td><td>1</td><td>1</td><td>3</td><td>2</td><td>1</td><td>1</td><td>1</td><td>1</td></tr>  <tr><td>1</td><td>1</td><td>3</td><td>4</td><td>4</td><td>2</td><td>1</td><td>1</td><td>2</td><td>1</td><td>2</td><td>1</td><td>3</td><td>2</td><td>2</td><td>1</td><td>1</td><td>1</td><td>1</td><td>1</td></tr>  <tr><td>2</td><td>2</td><td>1</td><td>2</td><td>2</td><td>4</td><td>3</td><td>1</td><td>1</td><td>1</td><td>4</td><td>1</td><td>1</td><td>5</td><td>1</td><td>1</td><td>1</td><td>1</td><td>1</td><td>1</td></tr>  <tr><td>1</td><td>1</td><td>1</td><td>1</td><td>2</td><td>5</td><td>1</td><td>1</td><td>1</td><td>1</td><td>2</td><td>2</td><td>4</td><td>3</td><td>1</td><td>1</td><td>1</td><td>1</td><td>1</td><td>1</td></tr> </tbody></table>';
new grill.Matrix().loadFromTable('#tablita').getOffsetMatrix().reduceToEnd();
