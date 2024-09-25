const webPush = require('web-push');

const VAPID_PUBLIC_KEY = 'BP8YPNFuhWE-EZ2Y9rkPE-R-Lx9ZfUcVRJ-cXMZ-kxlpWLqOlN2fbwyT-ea71SUwWEswvuBhs57bwU0MQaJKemM';
const VAPID_PRIVATE_KEY = 'C_PKh2y5sha4uMgQBcEpamo8hhmVhKmSkMmES6bjIZ0';

// Public Key:
// BP8YPNFuhWE-EZ2Y9rkPE-R-Lx9ZfUcVRJ-cXMZ-kxlpWLqOlN2fbwyT-ea71SUwWEswvuBhs57bwU0MQaJKemM

// Private Key:
// C_PKh2y5sha4uMgQBcEpamo8hhmVhKmSkMmES6bjIZ0


webPush.setVapidDetails(
    'mailto:tuemail@dominio.com',
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
  );


const notificacion = async (req, res) => {
    const subscription = req.body;


  res.status(201).json({});

  const payload = JSON.stringify({
    title: 'Notificación Push',
    body: 'Esto es una notificación push de prueba.',
  });

  webPush.sendNotification(subscription, payload)
    .then(result => console.log(result))
    .catch(e => console.error(e.stack));
}


module.exports = {
    notificacion
};