using GestaoContratos.Models;
using Microsoft.EntityFrameworkCore;

namespace GestaoContratos.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Contrato> Contratos => Set<Contrato>();
    public DbSet<AditamentoContrato> Aditamentos => Set<AditamentoContrato>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Contrato>()
            .HasMany(c => c.Aditamentos)
            .WithOne(a => a.Contrato)
            .HasForeignKey(a => a.ContratoId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
