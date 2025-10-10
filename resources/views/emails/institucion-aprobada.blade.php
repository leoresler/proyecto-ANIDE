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
            background: linear-gradient(135deg, #10B981 0%, #059669 100%);
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
        .success-box {
            background: linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%);
            border-left: 4px solid #10B981;
            padding: 20px;
            margin: 20px 0;
            border-radius: 5px;
        }
        .success-box h2 {
            color: #047857;
            margin-top: 0;
            font-size: 20px;
        }
        .success-box p {
            margin: 10px 0;
            color: #065f46;
        }
        .button {
            display: inline-block;
            background: #10B981;
            color: white;
            padding: 15px 35px;
            text-decoration: none;
            border-radius: 5px;
            margin: 25px 0;
            font-weight: bold;
            font-size: 16px;
        }
        .button:hover {
            background: #059669;
        }
        .info-list {
            background: white;
            padding: 20px;
            border-radius: 5px;
            margin: 20px 0;
        }
        .info-list h3 {
            color: #047857;
            margin-top: 0;
        }
        .info-list ul {
            margin: 10px 0;
            padding-left: 25px;
            color: #374151;
        }
        .info-list li {
            margin: 8px 0;
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
        <div class="icon">🎉</div>
        <h1>¡Felicitaciones!</h1>
    </div>

    <div class="content">
        <p>Hola <strong>{{ $nombre }}</strong>,</p>

        <div class="success-box">
            <h2>✅ Tu institución fue aprobada</h2>
            <p>¡Excelentes noticias! Tu institución <strong>{{ $institucion }}</strong> ha sido verificada exitosamente por nuestro equipo.</p>
        </div>

        <p>Ya podés acceder a todas las funcionalidades de la plataforma <strong>{{ config('app.name') }}</strong>.</p>

        <div style="text-align: center;">
            <a href="{{ config('app.url') }}/login" class="button">
                Iniciar Sesión
            </a>
        </div>

        <div class="info-list">
            <h3>¿Qué podés hacer ahora?</h3>
            <ul>
                <li>Acceder a la plataforma con tu usuario y contraseña</li>
                <li>Completar el perfil de tu institución</li>
                <li>Explorar la comunidad educativa</li>
                <li>Compartir recursos y experiencias</li>
                <li>Conectar con otras instituciones</li>
            </ul>
        </div>

        <p style="color: #6b7280; font-size: 14px; margin-top: 25px;">
            Si tenés alguna consulta, no dudes en contactarnos.
        </p>
    </div>

    <div class="footer">
        <p><strong>Equipo de {{ config('app.name') }}</strong></p>
        <p>Este es un email automático, por favor no respondas.</p>
        <p>© {{ date('Y') }} {{ config('app.name') }}. Todos los derechos reservados.</p>
    </div>
</body>
</html>