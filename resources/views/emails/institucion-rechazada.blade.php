<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
            color: white;
            padding: 30px 20px;
            text-align: center;
            border-radius: 5px 5px 0 0;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
        }
        .icon {
            font-size: 60px;
            margin-bottom: 10px;
        }
        .content {
            background: #f9fafb;
            padding: 30px;
            border: 1px solid #e5e7eb;
            border-top: none;
        }
        .warning-box {
            background: linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%);
            border-left: 4px solid #EF4444;
            padding: 20px;
            margin: 20px 0;
            border-radius: 5px;
        }
        .warning-box h2 {
            color: #991b1b;
            margin-top: 0;
            font-size: 20px;
        }
        .warning-box p {
            margin: 10px 0;
            color: #7f1d1d;
        }
        .reason-box {
            background: #fff7ed;
            border-left: 4px solid #F59E0B;
            padding: 20px;
            margin: 20px 0;
            border-radius: 5px;
        }
        .reason-box h3 {
            color: #92400e;
            margin-top: 0;
            font-size: 18px;
        }
        .reason-box p {
            margin: 10px 0;
            color: #92400e;
            font-style: italic;
        }
        .info-list {
            background: white;
            padding: 20px;
            border-radius: 5px;
            margin: 20px 0;
        }
        .info-list h3 {
            color: #374151;
            margin-top: 0;
        }
        .info-list ul {
            margin: 10px 0;
            padding-left: 25px;
            color: #4b5563;
        }
        .info-list li {
            margin: 8px 0;
        }
        .contact-box {
            background: #EFF6FF;
            border-left: 4px solid #3B82F6;
            padding: 20px;
            margin: 20px 0;
            border-radius: 5px;
            text-align: center;
        }
        .contact-box p {
            margin: 10px 0;
            color: #1e40af;
        }
        .footer {
            text-align: center;
            padding: 20px;
            color: #6b7280;
            font-size: 12px;
            background: #f9fafb;
            border-radius: 0 0 5px 5px;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="icon">❌</div>
        <h1>Solicitud No Aprobada</h1>
    </div>

    <div class="content">
        <p>Hola <strong>{{ $nombre }}</strong>,</p>

        <div class="warning-box">
            <h2>Tu solicitud de verificación no fue aprobada</h2>
            <p>Lamentamos informarte que tu institución no pudo ser verificada en este momento.</p>
        </div>

        <div class="reason-box">
            <h3>📋 Motivo del rechazo:</h3>
            <p>{{ $motivo }}</p>
        </div>

        <div class="info-list">
            <h3>¿Qué podés hacer?</h3>
            <ul>
                <li>Revisá que la información proporcionada sea correcta y completa</li>
                <li>Asegurate de que los documentos o datos enviados sean legibles y válidos</li>
                <li>Verificá que tu institución cumpla con los requisitos de la plataforma</li>
                <li>Si considerás que hubo un error, contactá a soporte</li>
            </ul>
        </div>

        <div class="contact-box">
            <p><strong>💬 ¿Necesitás ayuda?</strong></p>
            <p>Si tenés dudas o querés más información sobre el motivo del rechazo, contactanos a través de nuestros canales de soporte.</p>
        </div>

        <p style="color: #6b7280; font-size: 14px; margin-top: 25px;">
            Agradecemos tu interés en formar parte de <strong>{{ config('app.name') }}</strong>.
        </p>
    </div>

    <div class="footer">
        <p><strong>Equipo de {{ config('app.name') }}</strong></p>
        <p>Este es un email automático, por favor no respondas.</p>
        <p>© {{ date('Y') }} {{ config('app.name') }}. Todos los derechos reservados.</p>
    </div>
</body>
</html>