<?php
	error_log("Constructing xpdfsample from file");
	class XPDFSample extends Page {
		
		public static $arg_list = array('page' => '\d+',
                              'per_page' => '\d+',
                              'sort_by' => '\w+',
                              'order' => '\w+');
		
		public static $dispatch = array(
				array('/xpdfsample', 'get', '_xpdfsamples'),
				array('/', 'get', '_xpdfsamples')
				
		);
		
		function _xpdfsamples() {
			error_log('Retrieving xpdf samples');
			$this->_output(array('name' => 'ceria', 'sample' => true, 'density' => 7.65));
		}
	}
?>