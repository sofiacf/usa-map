<?php
require("login.php");

function parseToXML($htmlStr)
{
$xmlStr=str_replace('<','&lt;',$htmlStr);
$xmlStr=str_replace('>','&gt;',$xmlStr);
$xmlStr=str_replace('"','&quot;',$xmlStr);
$xmlStr=str_replace("'",'&apos;',$xmlStr);
$xmlStr=str_replace("&",'&amp;',$xmlStr);
return $xmlStr;
}

$connection=mysqli_connect ($servername, $username, $password);
if (!$connection) {
  die("Connection failed: " . mysqli_connect_error());
}

// Set the active MySQL database
$db_selected = mysqli_select_db($connection, $database);
if (!$db_selected) {
  die ('Can\'t use db : ' . mysqli_error($connection));
}

// Select all the rows in the markers table
$query = "SELECT * FROM couriers WHERE 1";
$result = mysqli_query($connection, $query);
if (!$result) {
  die('Invalid query: ' . mysqli_error($connection));
}

header("Content-type: text/xml");

// Start XML file, echo parent node
echo "<?xml version='1.0' ?>";
echo '<markers>';
$ind=0;
// Iterate through the rows, printing XML nodes for each
while ($row = @mysqli_fetch_assoc($result)){
  // Add to XML document node
  echo '<marker ';
  echo 'id="' . $row['id'] . '" ';
  echo 'name="' . parseToXML($row['name']) . '" ';
  echo 'place_id="' . parseToXML($row['place_id']) . '" ';
  echo 'lat="' . $row['lat'] . '" ';
  echo 'lng="' . $row['lng'] . '" ';
  echo 'city="' . $row['city'] . '" ';
  echo 'state="' . $row['state'] . '" ';
  echo 'grade="' . $row['grade'] . '" ';
  echo 'usa="' . $row['usa'] . '" ';
  echo 'iac="' . $row['iac'] . '" ';
  echo 'hm="' . $row['hm'] . '" ';
  echo 'tsa="' . $row['tsa'] . '" ';
  echo 'nfo="' . $row['nfo'] . '" ';
  echo 'vehicles="' . $row['vehicles'] . '" ';
  echo 'phone="' . $row['phone'] . '" ';
  echo 'fax="' . $row['fax'] . '" ';
  echo 'account="' . parseToXML($row['account']) . '" ';
  echo 'email="' . parseToXML($row['email']) . '" ';
  echo 'phone2="' . parseToXML($row['phone2']) . '" ';
  echo 'notes="' . parseToXML($row['notes']) . '" ';
  echo 'contact="' . parseToXML($row['contact']) . '"';
  echo '/>';
  $ind = $ind + 1;
}
echo '</markers>';
mysqli_close($connection);
?>
