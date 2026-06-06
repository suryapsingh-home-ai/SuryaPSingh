namespace PersonalWebsite.Helpers;

public static class MarkdownHelper
{
    public static string ToHtml(string markdown)
    {
        if (string.IsNullOrWhiteSpace(markdown))
            return string.Empty;

        var lines = markdown.Replace("\r\n", "\n").Split('\n');
        var html = new List<string>();
        var inList = false;

        foreach (var rawLine in lines)
        {
            var line = rawLine.Trim();

            if (line.StartsWith("## "))
            {
                CloseList(html, ref inList);
                html.Add($"<h2>{Escape(line[3..])}</h2>");
            }
            else if (line.StartsWith("### "))
            {
                CloseList(html, ref inList);
                html.Add($"<h3>{Escape(line[4..])}</h3>");
            }
            else if (line.StartsWith("- "))
            {
                if (!inList)
                {
                    html.Add("<ul>");
                    inList = true;
                }
                html.Add($"<li>{FormatInline(line[2..])}</li>");
            }
            else if (line.StartsWith("**") && line.EndsWith("**") && line.Length > 4)
            {
                CloseList(html, ref inList);
                html.Add($"<p><strong>{Escape(line[2..^2])}</strong></p>");
            }
            else if (string.IsNullOrWhiteSpace(line))
            {
                CloseList(html, ref inList);
            }
            else
            {
                CloseList(html, ref inList);
                html.Add($"<p>{FormatInline(line)}</p>");
            }
        }

        CloseList(html, ref inList);
        return string.Join('\n', html);
    }

    private static void CloseList(List<string> html, ref bool inList)
    {
        if (inList)
        {
            html.Add("</ul>");
            inList = false;
        }
    }

    private static string FormatInline(string text)
    {
        var result = Escape(text);
        var boldStart = 0;
        while (true)
        {
            var start = result.IndexOf("**", boldStart, StringComparison.Ordinal);
            if (start < 0) break;
            var end = result.IndexOf("**", start + 2, StringComparison.Ordinal);
            if (end < 0) break;
            var inner = result[(start + 2)..end];
            result = result[..start] + $"<strong>{inner}</strong>" + result[(end + 2)..];
            boldStart = start + 8 + inner.Length;
        }
        return result;
    }

    private static string Escape(string text) =>
        text.Replace("&", "&amp;").Replace("<", "&lt;").Replace(">", "&gt;");
}
