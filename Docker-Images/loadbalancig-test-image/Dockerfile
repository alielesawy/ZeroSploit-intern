# Use lightweight Python image
FROM python:3.9-alpine

# Set working directory
WORKDIR /app

# Install Flask
RUN pip install flask

# Copy the app files
COPY app.py .
COPY index.html .

# Expose port 80
EXPOSE 80

# Run the Python app
CMD ["python", "app.py"]
