package ma.project.sgpbse.dto.asset.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MachineResponseDto extends AssetResponseDto{

    private String serialNumber;
    private String machineType;
    private String assignment;

}
