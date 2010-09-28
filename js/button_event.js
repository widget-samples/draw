
//button highlighting
function setCName_sel(d, o) {

	var selbtns = document.getElementById(d).childNodes;
	for(var i=0; i<selbtns.length;i++) {
		if(selbtns[i].className == 'sel') { 
			selbtns[i].className=''; 
		}
	}
	o.className = 'sel';

}

function selCol(o, e, context) {
	//button highlighting
	setCName_sel('colors', o);

	// set color
	Draw.changeColor(o.style.background);
}

function selTool(o) {
	var newtool = o.id;
	document.getElementById('container').className = newtool;

	//button highlighting
	setCName_sel('buttons', o);

	// set tool
	Draw.changeTool(newtool);
}

function selSetting(o, linewidth) {
	//button highlighting
	setCName_sel('settings', o);

	// set line width	
	Draw.changeLineWidth(linewidth)
}

function resetTool(o) {
	setCName_sel("buttons",o);
	o.className = "";
}


