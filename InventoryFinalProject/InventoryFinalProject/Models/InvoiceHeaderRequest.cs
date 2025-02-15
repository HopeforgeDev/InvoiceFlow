using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace InventoryFinalProject.Models
{
    public class InvoiceHeaderRequest
    {
        public string ClientName { get; set; }
        public decimal Total { get; set; }
    }
}