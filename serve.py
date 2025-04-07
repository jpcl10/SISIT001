#!/usr/bin/env python3
"""
Servidor web simples para o Sistema UBS
Alternativa ao servidor Node.js quando ele não está disponível
"""

import http.server
import socketserver
import os
import sys
from urllib.parse import urlparse, parse_qs

# Configuração
PORT = 5555
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class UBSRequestHandler(http.server.SimpleHTTPRequestHandler):
    """Manipulador de requisições personalizado para o sistema UBS"""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)
    
    def log_message(self, format, *args):
        """Sobrescrever o método de log para mostrar informações mais detalhadas"""
        sys.stdout.write("%s - [%s] %s\n" %
                         (self.address_string(),
                          self.log_date_time_string(),
                          format % args))
        sys.stdout.flush()
    
    def do_GET(self):
        """Processa requisições GET"""
        # Rota de diagnóstico
        if self.path == '/api/status':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(b'{"status": "online", "server": "python"}')
            return
        
        # Para a página inicial, redirecionar para a página de login
        if self.path == '/' or self.path == '':
            self.send_response(302)
            self.send_header('Location', '/login-central-regulacao.html')
            self.end_headers()
            return
            
        # Definir tipos MIME corretos
        if self.path.endswith('.css'):
            self.extensions_map['.css'] = 'text/css'
        elif self.path.endswith('.js'):
            self.extensions_map['.js'] = 'application/javascript'
            
        # Lidar com outras requisições normalmente
        return http.server.SimpleHTTPRequestHandler.do_GET(self)

def run_server():
    """Inicia o servidor HTTP"""
    
    # Garantir que estamos no diretório correto
    os.chdir(DIRECTORY)
    
    # Configurar e iniciar o servidor
    with socketserver.TCPServer(("", PORT), UBSRequestHandler) as httpd:
        print("=" * 50)
        print(f"Servidor rodando na porta {PORT}")
        print(f"Acesse em: http://localhost:{PORT}")
        print(f"Acesse página de login: http://localhost:{PORT}/login-central-regulacao.html")
        print(f"Diretório: {DIRECTORY}")
        print("=" * 50)
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServidor encerrado pelo usuário")
        except Exception as e:
            print(f"\nErro: {e}")
        finally:
            httpd.server_close()

if __name__ == "__main__":
    run_server() 