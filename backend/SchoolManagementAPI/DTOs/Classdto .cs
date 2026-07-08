namespace SchoolManagementAPI.DTOs;

public class ClassDto
{
    public int     Id          { get; set; }
    public string  ClassName   { get; set; } = "";
    public string? Section     { get; set; }
    public int?    TeacherId   { get; set; }
    public string  DisplayName { get; set; } = "";
}