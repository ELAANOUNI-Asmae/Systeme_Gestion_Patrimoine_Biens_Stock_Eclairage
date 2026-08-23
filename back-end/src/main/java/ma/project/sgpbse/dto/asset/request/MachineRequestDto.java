package ma.project.sgpbse.dto.asset.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MachineRequestDto extends AssetRequestDto{

    @NotNull
    private String serialNumber;

    @NotNull
    private String machineType;

    @NotNull
    private Long hourMeter;

    @NotNull
    private Long kwMeter;
}
