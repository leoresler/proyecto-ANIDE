<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Error de Verificación</title>
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
            color: #F59E0B;
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
        .error-box {
            background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%);
            border-left: 5px solid #F59E0B;
            padding: 25px;
            border-radius: 10px;
            margin: 30px 0;
            box-shadow: 0 4px 12px rgba(245, 158, 11, 0.1);
        }
        .error-box p {
            margin: 0;
            color: #92400e;
            font-size: 17px;
            line-height: 1.6;
            font-weight: 500;
        }
        .reasons {
            background: #fff7ed;
            padding: 20px;
            border-radius: 8px;
            text-align: left;
            margin: 25px 0;
        }
        .reasons h3 {
            color: #92400e;
            font-size: 18px;
            margin-bottom: 15px;
        }
        .reasons ul {
            margin: 0;
            padding-left: 25px;
            color: #92400e;
        }
        .reasons li {
            margin: 8px 0;
            line-height: 1.5;
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
        <div class="icon">⚠️</div>
        <h1>Token Inválido o Expirado</h1>
        <p class="subtitle">No se pudo procesar la solicitud de verificación</p>
        
        <div class="error-box">
            <p>{{ $mensaje ?? 'El enlace de verificación no es válido o ya fue utilizado anteriormente.' }}</p>
        </div>

        <div class="reasons">
            <h3>Posibles causas:</h3>
            <ul>
                <li>El enlace ya fue utilizado previamente</li>
                <li>El enlace ha expirado</li>
                <li>La institución ya fue verificada por otro medio</li>
                <li>El formato del token es incorrecto</li>
            </ul>
        </div>

        <div class="close-hint">
            💡 Si necesitás realizar alguna acción sobre esta institución, por favor solicitá un nuevo enlace de verificación o contactá al soporte técnico.
        </div>

        <div class="footer">
            <p><strong>{{ config('app.name') }}</strong></p>
            <p>Sistema de verificación de instituciones</p>
        </div>
    </div>
</body>
</html>