<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'PHPMailer-master/src/Exception.php';
require 'PHPMailer-master/src/PHPMailer.php';
require 'PHPMailer-master/src/SMTP.php';

if($_SERVER['REQUEST_METHOD'] === 'POST') {

  $name = $_POST['name'];
  $email = $_POST['email'];
  $message = $_POST['message'];

  $mail = new PHPMailer(true);

  try {
    // SMTP CONFIG
    $mail->isSMTP();
    $mail->Host = 'smtp.hostinger.com';
    $mail->SMTPAuth = true;
    $mail->Username = 'contact@devdiagui.com'; 
    $mail->Password = 'Di@gui2025'; 
    $mail->SMTPSecure = 'ssl'; 
    $mail->Port = 465;

    // Email info
    $mail->setFrom('contact@devdiagui.com', 'Portfolio Contact');
    $mail->addAddress('contact@devdiagui.com'); 
    $mail->addReplyTo($email, $name);

    // Message
    $mail->isHTML(true);
    $mail->Subject = "📩 Nouveau message depuis ton portfolio";
    $mail->Body = "
      <strong>Nom:</strong> $name <br/>
      <strong>Email:</strong> $email <br/><br/>
      <strong>Message:</strong><br/> $message
    ";

    $mail->send();
    echo "success";

  } catch (Exception $e) {
    echo "error";
  }
}
