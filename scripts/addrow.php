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
echo $id;

$connection=mysqli_connect ($servername, $username, $password);
if (!$connection) die("Connection failed: " . mysqli_connect_error());

$db_selected = mysqli_select_db($connection, $database);
if (!$db_selected) die ('Can\'t use db : ' . mysqli_error($connection));

$query = sprintf("INSERT INTO couriers " .
         " (id, name, place_id, lat, lng, city, state, grade, usa, iac, hm, tsa, nfo, vehicles, phone, fax, account, email, phone2, notes, contact ) " .
         " VALUES ('%s', '%s', '%s', '%s','%s','%s','%s','%s','%s','%s','%s','%s','%s','%s','%s','%s','%s','%s', '%s', '%s', '%s');",
         mysqli_real_escape_string($connection, $id),
         mysqli_real_escape_string($connection, $name),
         mysqli_real_escape_string($connection, $place_id),
         mysqli_real_escape_string($connection, $lat),
         mysqli_real_escape_string($connection, $lng),
         mysqli_real_escape_string($connection, $city),
         mysqli_real_escape_string($connection, $state),
         mysqli_real_escape_string($connection, $grade),
         mysqli_real_escape_string($connection, $usa),
         mysqli_real_escape_string($connection, $iac),
         mysqli_real_escape_string($connection, $hm),
         mysqli_real_escape_string($connection, $tsa),
         mysqli_real_escape_string($connection, $nfo),
         mysqli_real_escape_string($connection, $vehicles),
         mysqli_real_escape_string($connection, $phone),
         mysqli_real_escape_string($connection, $fax),
         mysqli_real_escape_string($connection, $account),
         mysqli_real_escape_string($connection, $email),
         mysqli_real_escape_string($connection, $phone2),
         mysqli_real_escape_string($connection, $notes),
         mysqli_real_escape_string($connection, $contact));

$result = mysqli_query($connection, $query);

if (!$result) die('Invalid query: ' . mysqli_error($connection));
echo "hey";
?>
