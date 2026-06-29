<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>إعادة تعيين كلمة المرور - بيدق</title>
</head>
<body style="margin:0;padding:0;background:#0F1115;font-family:'Segoe UI',Tahoma,Arial,sans-serif;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#0F1115;padding:32px 16px;">
    <tr>
        <td align="center">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:linear-gradient(180deg,#1A1D24 0%,#12141A 100%);border:1px solid rgba(212,175,55,0.22);border-radius:20px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.45);">
                <tr>
                    <td style="height:4px;background:linear-gradient(90deg,#B8962E,#D4AF37,#B8962E);"></td>
                </tr>
                <tr>
                    <td style="padding:36px 32px 24px;text-align:center;">
                        <div style="display:inline-block;width:56px;height:56px;line-height:56px;border-radius:14px;background:rgba(212,175,55,0.14);color:#D4AF37;font-size:28px;margin-bottom:18px;">
                            ♟
                        </div>
                        <h1 style="margin:0 0 8px;font-size:24px;font-weight:800;color:#FFFFFF;">بيدق</h1>
                        <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.45);">متجر الشطرنج الفاخر</p>
                    </td>
                </tr>
                <tr>
                    <td style="padding:0 32px 32px;text-align:right;">
                        <h2 style="margin:0 0 16px;font-size:20px;font-weight:800;color:#FFFFFF;">إعادة تعيين كلمة المرور</h2>
                        <p style="margin:0 0 12px;font-size:15px;line-height:1.8;color:rgba(255,255,255,0.78);">
                            مرحباً {{ $userName }}،
                        </p>
                        <p style="margin:0 0 12px;font-size:15px;line-height:1.8;color:rgba(255,255,255,0.78);">
                            لقد تلقينا طلبًا لإعادة تعيين كلمة المرور الخاصة بحسابك.
                        </p>
                        <p style="margin:0 0 28px;font-size:15px;line-height:1.8;color:rgba(255,255,255,0.78);">
                            إذا كنت أنت من طلب ذلك، اضغط على الزر التالي.
                        </p>
                        <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 auto 28px;">
                            <tr>
                                <td align="center" style="border-radius:999px;background:linear-gradient(135deg,#D4AF37,#B8962E);">
                                    <a href="{{ $resetUrl }}" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:800;color:#0F1115;text-decoration:none;border-radius:999px;">
                                        إعادة تعيين كلمة المرور
                                    </a>
                                </td>
                            </tr>
                        </table>
                        <p style="margin:0 0 8px;font-size:12px;line-height:1.7;color:rgba(255,255,255,0.45);">
                            ينتهي صلاحية هذا الرابط خلال 60 دقيقة ويمكن استخدامه مرة واحدة فقط.
                        </p>
                        <p style="margin:0;font-size:12px;line-height:1.7;color:rgba(255,255,255,0.35);word-break:break-all;">
                            {{ $resetUrl }}
                        </p>
                    </td>
                </tr>
                <tr>
                    <td style="padding:20px 32px 28px;border-top:1px solid rgba(212,175,55,0.12);text-align:center;">
                        <p style="margin:0;font-size:12px;line-height:1.7;color:rgba(255,255,255,0.45);">
                            إذا لم تطلب إعادة تعيين كلمة المرور، يمكنك تجاهل هذه الرسالة.
                        </p>
                        <p style="margin:12px 0 0;font-size:11px;color:rgba(212,175,55,0.55);">© {{ date('Y') }} بيدق — Beidaq</p>
                    </td>
                </tr>
            </table>
        </td>
    </tr>
</table>
</body>
</html>
