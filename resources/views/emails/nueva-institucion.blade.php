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
            background: #2A3A47;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 5px 5px 0 0;
        }

        .content {
            background: #f9fafb;
            padding: 30px;
            border: 1px solid #e5e7eb;
        }

        .info-box {
            background: white;
            padding: 15px;
            margin: 15px 0;
            border-left: 4px solid #2A3A47;
        }

        .info-box p {
            margin: 5px 0;
        }

        .info-box strong {
            color: #2A3A47;
        }

        .button {
            display: inline-block;
            background: #2A3A47;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
        }

        .footer {
            text-align: center;
            padding: 20px;
            color: #6b7280;
            font-size: 12px;
        }
    </style>
</head>

<body>
    <div class="header">
        <h1>Nueva Institución Registrada</h1>
    </div>

    <div class="content">

        <p>Se ha registrado una nueva institución que requiere tu verificación manual:</p>

        <div class="info-box">
            <p><strong>Nombre:</strong> {{ $user->nombre }}</p>
            <p><strong>Email:</strong> {{ $user->email }}</p>
            <p><strong>Teléfono:</strong> {{ $user->telefono }}</p>
            @if ($user->institucion)
                <p><strong>Tipo de documento:</strong> {{ $user->institucion->tipo_documento }}</p>
                <p><strong>Documento:</strong> {{ $user->institucion->doc_identificador }}</p>
                <p><strong>Tipo:</strong> {{ $user->institucion->tipo_institucion }}</p>
                <p><strong>Dirección:</strong> {{ $user->institucion->direccion }}</p>
                <p><strong>Ciudad:</strong> {{ $user->institucion->ciudad ?? 'No especificada' }}</p>
                <p><strong>Provincia:</strong> {{ $user->institucion->provincia ?? 'No especificada' }}</p>
            @endif
        </div>

        <p><strong>Fecha de registro:</strong> {{ $user->created_at->format('d/m/Y H:i') }}</p>

        <div style="margin-top: 30px; text-align: center;">
            <a href="{{ $urlAprobar }}"
                style="display:inline-block; background-color:#16a34a; color:#fff; padding:10px 20px;
              text-decoration:none; border-radius:6px; margin-right:10px;">
                ✅ Aprobar institución
            </a>

            <a href="{{ $urlRechazar }}"
                style="display:inline-block; background-color:#dc2626; color:#fff; padding:10px 20px;
              text-decoration:none; border-radius:6px;">
                ❌ Rechazar institución
            </a>
        </div>

        <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
            Esta institución no podrá acceder a la plataforma hasta que sea verificada.
        </p>
    </div>

    <div class="footer">
        <p>Este es un email automático, por favor no respondas.</p>
        <p>© {{ date('Y') }} {{ config('app.name') }}</p>
    </div>
</body>

</html>
