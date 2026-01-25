import os
import io
import time
import hmac
import hashlib
import base64
import json
import requests
import traceback

import matplotlib
matplotlib.use('Agg')  # Use non-interactive backend
import matplotlib.pyplot as plt
import numpy as np

from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image as RLImage
from reportlab.lib.styles import getSampleStyleSheet

class EmailService:
    def __init__(self):
        self.access_key = os.environ.get('NCP_ACCESS_KEY', '')
        self.secret_key = os.environ.get('NCP_SECRET_KEY', '')
        self.sender_address = os.environ.get('SENDER_EMAIL', 'noreply@stress-diagnosis.com')
        # API Gateway URL (default is KR)
        self.api_url = "https://mail.apigw.ntruss.com/api/v1/mails"

    def _make_signature(self, timestamp):
        secret_key = bytes(self.secret_key, 'UTF-8')
        method = "POST"
        uri = "/api/v1/mails"
        message = method + " " + uri + "\n" + timestamp + "\n" + self.access_key
        message = bytes(message, 'UTF-8')
        signing_key = base64.b64encode(hmac.new(secret_key, message, digestmod=hashlib.sha256).digest())
        return signing_key

    def generate_radar_chart(self, chart_data):
        """
        Generates a radar chart image from data.
        Returns bytes of the PNG image.
        """
        labels = [item['label'] for item in chart_data['axes']]
        scores = [item['score'] for item in chart_data['axes']]
        
        # Number of variables
        num_vars = len(labels)

        # Compute angle of each axis
        angles = np.linspace(0, 2 * np.pi, num_vars, endpoint=False).tolist()
        
        # The plot is a circle, so we need to "close the loop"
        scores += [scores[0]]
        angles += [angles[0]]
        
        fig, ax = plt.subplots(figsize=(6, 6), subplot_kw=dict(polar=True))
        
        ax.plot(angles, scores, color='#8884d8', linewidth=2)
        ax.fill(angles, scores, color='#8884d8', alpha=0.25)
        
        # Fix axis to go top
        ax.set_theta_offset(np.pi / 2)
        ax.set_theta_direction(-1)
        
        # Draw axis lines and labels
        ax.set_xticks(angles[:-1])
        ax.set_xticklabels(labels, fontsize=10)
        
        # Y labels
        ax.set_rlabel_position(0)
        plt.yticks([1, 2, 3, 4, 5], ["1", "2", "3", "4", "5"], color="grey", size=7)
        plt.ylim(0, 5)
        
        # Title
        plt.title(chart_data['label'], size=15, color='#333', y=1.1)

        buf = io.BytesIO()
        plt.savefig(buf, format='png', bbox_inches='tight')
        plt.close(fig)
        buf.seek(0)
        return buf

    def generate_pdf_report(self, diagnosis_result, chart_images):
        """
        Generates a PDF report.
        chart_images: Dict of chart label -> BytesIO
        """
        buf = io.BytesIO()
        doc = SimpleDocTemplate(buf, pagesize=A4)
        styles = getSampleStyleSheet()
        story = []

        # Title
        title_style = styles['Title']
        story.append(Paragraph("Stress Diagnosis Result", title_style))
        story.append(Spacer(1, 12))

        # Summary
        story.append(Paragraph(f"High Stress: {'YES' if diagnosis_result['result']['high_stress'] else 'NO'}", styles['Heading2']))
        
        scores = diagnosis_result['result']['summary_scores']
        summary_text = f"Factor A (Causes): {scores['sum_a']} | Factor B (Responses): {scores['sum_b']} | Factor C (Support): {scores['sum_c']}"
        story.append(Paragraph(summary_text, styles['Normal']))
        story.append(Spacer(1, 24))

        # Charts
        story.append(Paragraph("Detailed Charts", styles['Heading2']))
        story.append(Spacer(1, 12))

        for label, img_buf in chart_images.items():
            img_buf.seek(0)
            img = RLImage(img_buf, width=400, height=400)
            story.append(Paragraph(label, styles['Heading3']))
            story.append(img)
            story.append(Spacer(1, 12))

        doc.build(story)
        buf.seek(0)
        return buf

    def send_diagnosis_email(self, to_email, diagnosis_result):
        try:
            timestamp = str(int(time.time() * 1000))
            
            # Generate charts and PDF
            chart_images = {}
            for chart in diagnosis_result['charts']:
                chart_images[chart['label']] = self.generate_radar_chart(chart)
                
            pdf_buf = self.generate_pdf_report(diagnosis_result, chart_images)
            pdf_bytes = pdf_buf.read()
            pdf_base64 = base64.b64encode(pdf_bytes).decode('utf-8')

            # Prepare Attachments
            # We attach the PDF.
            # Ideally, we also attach the chart image for inline display if needed, but keeping it simple for now.
            attachments = [
                {
                    "name": "diagnosis_report.pdf",
                    "body": pdf_base64
                }
            ]

            # Prepare JSON Payload
            payload = {
                "senderAddress": self.sender_address,
                "title": f"Stress Diagnosis Result ({'High Risk' if diagnosis_result['result']['high_stress'] else 'Normal'})",
                "body": f"""
                <html>
                    <body>
                        <h1>Stress Diagnosis Result</h1>
                        <p>Thank you for using our service.</p>
                        <p><b>High Stress:</b> {'YES' if diagnosis_result['result']['high_stress'] else 'NO'}</p>
                        <p>Please find the detailed report attached.</p>
                    </body>
                </html>
                """,
                "recipients": [
                    {
                        "address": to_email,
                        "type": "R"
                    }
                ],
                "individual": True,
                "advertising": False,
                "attachFiles": attachments
            }

            headers = {
                "Content-Type": "application/json",
                "x-ncp-apigw-timestamp": timestamp,
                "x-ncp-iam-access-key": self.access_key,
                "x-ncp-apigw-signature-v2": self._make_signature(timestamp)
            }

            response = requests.post(self.api_url, headers=headers, json=payload)
            
            if response.status_code == 201:
                return True, "Email sent successfully"
            else:
                return False, f"Failed to send email: {response.text}"

        except Exception as e:
            traceback.print_exc()
            return False, str(e)
