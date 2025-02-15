using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace InventoryFinalProject.Models
{
    public class UpdateInvoiceDetailRequest
    {
        public int IdSeq { get; set; }
        public string ItemName { get; set; }
        public int Qty { get; set; }
        public decimal Price { get; set; }
    }
}