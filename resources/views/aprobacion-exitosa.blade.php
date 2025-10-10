<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Institución Aprobada</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .container {
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            max-width: 600px;
            width: 100%;
            padding: 50px 40px;
            text-align: center;
            animation: slideIn 0.5s ease;
        }
        .icon {
            font-size: 90px;
            margin-bottom: 25px;
        }
        h1 {
            color: #10B981;
            font-size: 32px;
            margin-bottom: 15px;
            font-weight: 700;
        }
        .subtitle {
            color: #6b7280;
            font-size: 18px;
            margin-bottom: 30px;
            line-height: 1.6;
        }
        .info-box {
            background: linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%);
            border-left: 5px solid #10B981;
            padding: 25px;
            border-radius: 10px;
            text-align: left;
            margin: 30px 0;
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.1);
        }
        .info-box p {
            margin: 12px 0;
            color: #065f46;
            font-size: 16px;
            line-height: 1.6;
        }
        .info-box strong {
            color: #047857;
            font-weight: 600;
        }
        .success-badge {
            display: inline-block;
            background: #10B981;
            color: white;
            padding: 8px 20px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
            margin-top: 5px;
        }
        .footer {
            margin-top: 35px;
            padding-top: 25px;
            border-top: 2px solid #e5e7eb;
            color: #9ca3af;
            font-size: 14px;
        }
        .close-hint {
            background: #f3f4f6;
            padding: 15px;
            border-radius: 8px;
            margin-top: 20px;
            color: #6b7280;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="icon">✅</div>
        <h1>¡Institución Aprobada!</h1>
        <p class="subtitle">La verificación se completó exitosamente</p>
        
        <div class="info-box">
            <p><strong>Institución:</strong> {{ $user->nombre }}</p>
            <p><strong>Email:</strong> {{ $user->email }}</p>
            <p><strong>Estado:</strong> <span class="success-badge">Activa ✓</span></p>
            <p style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #d1fae5;">
                <strong>Acción completada:</strong><br>
                • La institución puede acceder a la plataforma<br>
                • Se envió un email de confirmación<br>
                • El token de aprobación fue invalidado
            </p>
        </div>

        <div class="close-hint">
            💡 Ya podés cerrar esta ventana. La institución fue notificada por email.
        </div>

        <div class="footer">
            <p><strong>{{ config('app.name') }}</strong></p>
            <p>Sistema de verificación de instituciones</p>
        </div>
    </div>
</body>
</html>