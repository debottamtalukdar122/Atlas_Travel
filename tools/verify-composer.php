<?php
$signature=json_decode(file_get_contents(__DIR__.'/composer.phar.sig'),true);
$publicKey=openssl_pkey_get_public(file_get_contents(__DIR__.'/releases.pub'));
if(!$signature||!isset($signature['sha384'])||!$publicKey){fwrite(STDERR,"Composer signature metadata is invalid.\n");exit(1);}
$valid=openssl_verify(file_get_contents(__DIR__.'/composer.phar'),base64_decode($signature['sha384'],true),$publicKey,OPENSSL_ALGO_SHA384);
if($valid!==1){fwrite(STDERR,"Composer PHAR signature verification failed.\n");exit(1);}
fwrite(STDOUT,"Composer PHAR signature verified.\n");
