GeoAnnotator.AnnotationInfoPanelCtrl.test = function (step) {
    var thisCtrl = GeoAnnotator.AnnotationInfoPanelCtrl;
    var html = '';
    switch (step) {
	case 0:
	    html = "\
		<table> <tr> \
		    <td class='QuestionBackground' valign='middle' align='left' height='75'> &nbsp;</td> \
		    <td colspan='6' valign='middle' class='QuestionBackground'> \
			<div> \
			    <span id='QuestionTitle1' class='QuestionTitle'>1. Do you usually walk or bike on the route you just drew? </span> \
			</div> \
			<span class='QuestionSubTitle'> \
			    <table id='' class='QuestionText' border='0'> \
				<tbody><tr> \
				    <td><input type='radio' name='QA1' value='A'>&nbsp;Walk</td> \
				    </tr><tr> \
				    <td><input type='radio' name='QA1' value='B'>&nbsp;Bike</td> \
				</tr> </tbody> \
			    </table> \
			    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; \
			</span> \
			<br> \
			<div> \
			   <input type='button' value='Back' hide='true'><span class='buttonSeparator'>&nbsp;&nbsp;&nbsp;</span><input type='button' value='Next' onclick='GeoAnnotator.AnnotationInfoPanelCtrl.nextQuestion(0)'> \
			</div> \
		    </td> \
		    <td class='QuestionBackground' valign='middle' align='left'> &nbsp;</td> \
		</tr> </table> \
		"
	    break;
	case 1:
	    html = "\
		<table> <tr> \
		    <td class='QuestionBackground' valign='middle' align='left' height='75'> &nbsp;</td> \
		    <td colspan='6' valign='middle' class='QuestionBackground'> \
			<div> \
			    <span id='SurveyPage_SurveyQuestions_ctl01_ctl00_QuestionText' class='QuestionTitle'>1. Do you usually walk or bike on the route you just drew? </span> \
			</div> \
			<span class='QuestionSubTitle'> \
			    <table id='SurveyPage_SurveyQuestions_ctl01_ctl00_Options' class='QuestionText' border='0'> \
				<tbody><tr> \
				    <td><input id='SurveyPage_SurveyQuestions_ctl01_ctl00_Options_0' type='radio' name='' value='6490'><label for='SurveyPage_SurveyQuestions_ctl01_ctl00_Options_0'><span class='CheckboxSeparator'>&nbsp;</span>5 - Very Satisfied</label></td> \
			    </tr><tr> \
				    <td><input id='SurveyPage_SurveyQuestions_ctl01_ctl00_Options_1' type='radio' name='SurveyPage$SurveyQuestions$ctl01$ctl00$Options' value='6491'><label for='SurveyPage_SurveyQuestions_ctl01_ctl00_Options_1'><span class='CheckboxSeparator'>&nbsp;</span>4 - Somewhat Satisfied</label></td> \
			    </tr><tr> \
				    <td><input id='SurveyPage_SurveyQuestions_ctl01_ctl00_Options_2' type='radio' name='SurveyPage$SurveyQuestions$ctl01$ctl00$Options' value='6492'><label for='SurveyPage_SurveyQuestions_ctl01_ctl00_Options_2'><span class='CheckboxSeparator'>&nbsp;</span>3 - Neither Satisfied Nor Dissatisfied</label></td> \
			    </tr><tr> \
				    <td><input id='SurveyPage_SurveyQuestions_ctl01_ctl00_Options_3' type='radio' name='SurveyPage$SurveyQuestions$ctl01$ctl00$Options' value='6493'><label for='SurveyPage_SurveyQuestions_ctl01_ctl00_Options_3'><span class='CheckboxSeparator'>&nbsp;</span>2 - Somewhat Dissatisfied</label></td> \
			    </tr><tr> \
				    <td><input id='SurveyPage_SurveyQuestions_ctl01_ctl00_Options_4' type='radio' name='SurveyPage$SurveyQuestions$ctl01$ctl00$Options' value='6494'><label for='SurveyPage_SurveyQuestions_ctl01_ctl00_Options_4'><span class='CheckboxSeparator'>&nbsp;</span>1 - Very Dissatisfied</label></td> \
				</tr> </tbody> \
			    </table> \
			    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; \
			</span> \
			<br> \
		    </td> \
		    <td class='QuestionBackground' valign='middle' align='left'> &nbsp;</td> \
		</tr> </table> \
		"
	    break;
	case 2:
	    html = "\
		<table> <tr> \
		    <td class='QuestionBackground' valign='middle' align='left' height='75'> &nbsp;</td> \
		    <td colspan='6' valign='middle' class='QuestionBackground'> \
			<div> \
			    <span id='SurveyPage_SurveyQuestions_ctl01_ctl00_QuestionText' class='QuestionTitle'>1. Do you usually walk or bike on the route you just drew? </span> \
			</div> \
			<span class='QuestionSubTitle'> \
			    <table id='SurveyPage_SurveyQuestions_ctl01_ctl00_Options' class='QuestionText' border='0'> \
				<tbody><tr> \
				    <td><input id='SurveyPage_SurveyQuestions_ctl01_ctl00_Options_0' type='radio' name='' value='6490'><label for='SurveyPage_SurveyQuestions_ctl01_ctl00_Options_0'><span class='CheckboxSeparator'>&nbsp;</span>5 - Very Satisfied</label></td> \
			    </tr><tr> \
				    <td><input id='SurveyPage_SurveyQuestions_ctl01_ctl00_Options_1' type='radio' name='SurveyPage$SurveyQuestions$ctl01$ctl00$Options' value='6491'><label for='SurveyPage_SurveyQuestions_ctl01_ctl00_Options_1'><span class='CheckboxSeparator'>&nbsp;</span>4 - Somewhat Satisfied</label></td> \
			    </tr><tr> \
				    <td><input id='SurveyPage_SurveyQuestions_ctl01_ctl00_Options_2' type='radio' name='SurveyPage$SurveyQuestions$ctl01$ctl00$Options' value='6492'><label for='SurveyPage_SurveyQuestions_ctl01_ctl00_Options_2'><span class='CheckboxSeparator'>&nbsp;</span>3 - Neither Satisfied Nor Dissatisfied</label></td> \
			    </tr><tr> \
				    <td><input id='SurveyPage_SurveyQuestions_ctl01_ctl00_Options_3' type='radio' name='SurveyPage$SurveyQuestions$ctl01$ctl00$Options' value='6493'><label for='SurveyPage_SurveyQuestions_ctl01_ctl00_Options_3'><span class='CheckboxSeparator'>&nbsp;</span>2 - Somewhat Dissatisfied</label></td> \
			    </tr><tr> \
				    <td><input id='SurveyPage_SurveyQuestions_ctl01_ctl00_Options_4' type='radio' name='SurveyPage$SurveyQuestions$ctl01$ctl00$Options' value='6494'><label for='SurveyPage_SurveyQuestions_ctl01_ctl00_Options_4'><span class='CheckboxSeparator'>&nbsp;</span>1 - Very Dissatisfied</label></td> \
				</tr> </tbody> \
			    </table> \
			    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; \
			</span> \
			<br> \
		    </td> \
		    <td class='QuestionBackground' valign='middle' align='left'> &nbsp;</td> \
		</tr> </table> \
		"
	    break;
	case 3:
	    html = "\
		<table> <tr> \
		    <td class='QuestionBackground' valign='middle' align='left' height='75'> &nbsp;</td> \
		    <td colspan='6' valign='middle' class='QuestionBackground'> \
			<div> \
			    <span id='SurveyPage_SurveyQuestions_ctl01_ctl00_QuestionText' class='QuestionTitle'>1. Do you usually walk or bike on the route you just drew? </span> \
			</div> \
			<span class='QuestionSubTitle'> \
			    <table id='SurveyPage_SurveyQuestions_ctl01_ctl00_Options' class='QuestionText' border='0'> \
				<tbody><tr> \
				    <td><input id='SurveyPage_SurveyQuestions_ctl01_ctl00_Options_0' type='radio' name='' value='6490'><label for='SurveyPage_SurveyQuestions_ctl01_ctl00_Options_0'><span class='CheckboxSeparator'>&nbsp;</span>5 - Very Satisfied</label></td> \
			    </tr><tr> \
				    <td><input id='SurveyPage_SurveyQuestions_ctl01_ctl00_Options_1' type='radio' name='SurveyPage$SurveyQuestions$ctl01$ctl00$Options' value='6491'><label for='SurveyPage_SurveyQuestions_ctl01_ctl00_Options_1'><span class='CheckboxSeparator'>&nbsp;</span>4 - Somewhat Satisfied</label></td> \
			    </tr><tr> \
				    <td><input id='SurveyPage_SurveyQuestions_ctl01_ctl00_Options_2' type='radio' name='SurveyPage$SurveyQuestions$ctl01$ctl00$Options' value='6492'><label for='SurveyPage_SurveyQuestions_ctl01_ctl00_Options_2'><span class='CheckboxSeparator'>&nbsp;</span>3 - Neither Satisfied Nor Dissatisfied</label></td> \
			    </tr><tr> \
				    <td><input id='SurveyPage_SurveyQuestions_ctl01_ctl00_Options_3' type='radio' name='SurveyPage$SurveyQuestions$ctl01$ctl00$Options' value='6493'><label for='SurveyPage_SurveyQuestions_ctl01_ctl00_Options_3'><span class='CheckboxSeparator'>&nbsp;</span>2 - Somewhat Dissatisfied</label></td> \
			    </tr><tr> \
				    <td><input id='SurveyPage_SurveyQuestions_ctl01_ctl00_Options_4' type='radio' name='SurveyPage$SurveyQuestions$ctl01$ctl00$Options' value='6494'><label for='SurveyPage_SurveyQuestions_ctl01_ctl00_Options_4'><span class='CheckboxSeparator'>&nbsp;</span>1 - Very Dissatisfied</label></td> \
				</tr> </tbody> \
			    </table> \
			    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; \
			</span> \
			<br> \
		    </td> \
		    <td class='QuestionBackground' valign='middle' align='left'> &nbsp;</td> \
		</tr> </table> \
		"
	    break;
    }
    thisCtrl.annotationInfoDisplayPanel.body.update(html);
};

//GeoAnnotator.AnnotationInfoPanelCtrl.nextQuestion() = function (currStep) {
//    $('input[name="genderS"]:checked').val();
//    if (currStep == 0) {
//	nextStep = 2;
//    }
//    nextStep = currStep + 1;
//};
