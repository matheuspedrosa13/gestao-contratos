# Gestão de Contratos

API para gestão de contratos corporativos com alertas de vencimento. Desenvolvida com **ASP.NET Core 8** e **C# 12**.

## Funcionalidades

- Cadastro de contratos com fornecedor, valor, tipo e responsável
- Aditamentos com atualização de valor e prazo
- Alertas automáticos: contratos vencidos e vencendo em 30 dias
- Atualização de status (Ativo, Encerrado, Suspenso, Em Renovação)
- Filtros por status
- Swagger UI integrado

## Tecnologias

- ASP.NET Core 8 (Minimal API + MVC Controllers)
- Entity Framework Core 8
- SQLite
- Swashbuckle (Swagger)

## Como rodar

```bash
cd GestaoContratos
dotnet run
```

- API: http://localhost:5000
- Swagger: http://localhost:5000/swagger
- Frontend: abrir `frontend/index.html` no browser

## Endpoints

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/v1/contratos` | Listar contratos |
| GET | `/api/v1/contratos/{id}` | Buscar contrato |
| POST | `/api/v1/contratos` | Criar contrato |
| PATCH | `/api/v1/contratos/{id}/status` | Atualizar status |
| POST | `/api/v1/contratos/{id}/aditamentos` | Adicionar aditamento |
| DELETE | `/api/v1/contratos/{id}` | Remover contrato |
| GET | `/api/v1/contratos/alertas` | Contratos vencidos / vencendo |
