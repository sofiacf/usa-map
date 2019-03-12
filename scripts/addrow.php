<?php
require("login.php");
$id = $_GET['id'];
$name = $_GET['name'];
$place_id = $_GET['place_id'];
$lat = $_GET['lat'];
$lng = $_GET['lng'];
$city = $_GET['city'];
$state = $_GET['state'];
$grade = $_GET['grade'];
$usa = $_GET['usa'];
$iac = $_GET['iac'];
$hm = $_GET['hm'];
$tsa = $_GET['tsa'];
$nfo = $_GET['nfo'];
$vehicles = $_GET['vehicles'];
$phone = $_GET['phone'];
$fax = $_GET['fax'];
$account = $_GET['account'];
$email = $_GET['email'];
$phone2 = $_GET['phone2'];
$notes = $_GET['notes'];
$contact = $_GET['contact'];

$connection=mysqli_connect ($servername, $username, $password);
if (!$connection) die("Connection failed: " . mysqli_connect_error());

$db_selected = mysqli_select_db($connection, $database);
if (!$db_selected) die ('Can\'t use db : ' . mysqli_error($connection));

$query = sprintf("INSERT INTO couriers " .
         " (id, name, place_id, lat, lng, city, state, grade, usa, iac, hm, tsa, nfo, vehicles, phone, fax, account, email, phone2, notes, contact ) " .
         " VALUES ('%s', '%s', '%s', '%s','%s','%s','%s','%s','%s','%s','%s','%s','%s','%s','%s','%s','%s','%s', '%s', '%s', '%s');",
         mysql_real_escape_string($id),
         mysql_real_escape_string($name),
         mysql_real_escape_string($place_id),
         mysql_real_escape_string($lat),
         mysql_real_escape_string($lng),
         mysql_real_escape_string($city),
         mysql_real_escape_string($state),
         mysql_real_escape_string($grade),
         mysql_real_escape_string($usa),
         mysql_real_escape_string($iac),
         mysql_real_escape_string($hm),
         mysql_real_escape_string($tsa),
         mysql_real_escape_string($nfo),
         mysql_real_escape_string($vehicles),
         mysql_real_escape_string($phone),
         mysql_real_escape_string($fax),
         mysql_real_escape_string($account),
         mysql_real_escape_string($email),
         mysql_real_escape_string($phone2),
         mysql_real_escape_string($notes),
         mysql_real_escape_string($contact));

$result = mysql_query($query);

if (!$result) die('Invalid query: ' . mysql_error($connection));
echo "hey";
?>
