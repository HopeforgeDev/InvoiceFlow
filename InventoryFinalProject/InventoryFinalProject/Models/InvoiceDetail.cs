using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace InventoryFinalProject.Models
{
    public class InvoiceDetail
    {
        [Key]
        public int IdSeq { get; set; }

        [ForeignKey("InvoiceHeader")]
        public int FkIhSeq { get; set; }
        public string IdItemName { get; set; }
        public int IdQty { get; set; }
        public decimal IdPrice { get; set; }
        public virtual InvoiceHeader InvoiceHeader { get; set; }
    }
}