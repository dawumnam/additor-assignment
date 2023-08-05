export class RegisterDto {
  public email!: string;
  public name!: string;

  public static of(email: string, name: string): RegisterDto {
    const registerDto = new RegisterDto();
    registerDto.email = email;
    registerDto.name = name;
    return registerDto;
  }
}

export class ChangeDto {
  public version!: number;
  public index!: number;
  public insertion!: string | undefined;
  public deletionLength!: number | undefined;

  public static of(
    version: number,
    index: number,
    insertion: string | undefined,
    deletionLength: number | undefined
  ): ChangeDto {
    const changeDto = new ChangeDto();
    changeDto.version = version;
    changeDto.index = index;
    changeDto.insertion = insertion;
    changeDto.deletionLength = deletionLength;
    return changeDto;
  }
}
